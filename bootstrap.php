<?php

use Illuminate\Events\Dispatcher;
use Flarum\Event;
use Flarum\Tags\Event\TagWillBeSaved;
use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Tags\Tag;
use Flarum\Core\User;
use Flarum\Core\Discussion;
use Illuminate\Database\Query\Expression;
use Tobscure\TagPasswords\AuthController;

function tobscure_tag_passwords_is_unlocked(User $actor, Tag $tag)
{
    return $actor->getSession()->has('tag_'.$tag->id.'_unlocked') || ! empty($tag->state->is_unlocked);
}

return function (Dispatcher $events) {
    $events->listen(Event\ConfigureWebApp::class, function (Event\ConfigureWebApp $event) {
        if ($event->isAdmin()) {
            $event->addAssets([
                __DIR__.'/js/admin/dist/extension.js'
            ]);
            $event->addBootstrapper('tobscure/tag-passwords/main');
        }
        if ($event->isForum()) {
            $event->addAssets([
                __DIR__.'/js/forum/dist/extension.js',
                __DIR__.'/less/forum/extension.less'
            ]);
            $event->addBootstrapper('tobscure/tag-passwords/main');
        }
    });

    $events->listen(Event\ConfigureLocales::class, function (Event\ConfigureLocales $event) {
        foreach (new DirectoryIterator(__DIR__.'/locale') as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['yml', 'yaml'])) {
                $event->locales->addTranslations($file->getBasename('.'.$file->getExtension()), $file->getPathname(), 'tobscure.tag_passwords');
            }
        }
    });

    $events->listen(Event\ConfigureApiRoutes::class, function (Event\ConfigureApiRoutes $event) {
        $event->post('/tags/{id}/auth', 'tobscure.tag_passwords::auth', AuthController::class);
    });

    $events->listen(TagWillBeSaved::class, function (TagWillBeSaved $event) {
        if (isset($event->data['attributes']['password'])) {
            $event->tag->password = $event->data['attributes']['password'] ?: null;
        }
    });

    $events->listen(Event\PrepareApiAttributes::class, function (Event\PrepareApiAttributes $event) {
        if ($event->isSerializer(TagSerializer::class)) {
            $event->attributes['isPasswordProtected'] = (bool) $event->model->password;
            $event->attributes['isUnlocked'] = tobscure_tag_passwords_is_unlocked($event->actor, $event->model);

            if ($event->actor->isAdmin()) {
                $event->attributes['password'] = $event->model->password;
            }
        }
    });

    // Hide discussions which have tags that are password-protected.
    $events->listen(Event\ScopeModelVisibility::class, function (Event\ScopeModelVisibility $event) {
        if ($event->model instanceof Discussion) {
            $event->query->whereNotExists(function ($query) use ($event) {
                $tags = Tag::whereNotNull('password')->withStateFor($event->actor)->get()->filter(function ($tag) use ($event) {
                    return ! tobscure_tag_passwords_is_unlocked($event->actor, $tag);
                });

                return $query->select(new Expression(1))
                    ->from('discussions_tags')
                    ->whereIn('tag_id', $tags->lists('id'))
                    ->where('discussions.id', new Expression('discussion_id'));
            });
        }
    });

    $events->listen(Event\GetPermission::class, function (Event\GetPermission $event) {
        if ($event->model instanceof Tag && ($event->ability === 'startDiscussion' || $event->ability === 'addToDiscussion')) {
            if ($event->model->password && ! tobscure_tag_passwords_is_unlocked($event->actor, $event->model)) {
                return false;
            }
        }
    });

    $events->listen(Event\GetApiRelationship::class, function (Event\GetApiRelationship $event) {
        if ($event->isRelationship(TagSerializer::class, 'lastDiscussion') && $event->model->password) {
            if (! tobscure_tag_passwords_is_unlocked($event->serializer->getActor(), $event->model)) {
                return new Tobscure\JsonApi\Relationship(new Tobscure\JsonApi\Resource(null, $event->serializer->getContainer()->make(Flarum\Api\Serializer\DiscussionSerializer::class)));
            }
        }
    });
};
