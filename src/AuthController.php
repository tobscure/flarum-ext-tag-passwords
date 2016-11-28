<?php

namespace Tobscure\TagPasswords;

use Flarum\Http\Controller\ControllerInterface;
use Flarum\Tags\TagRepository;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Core\Exception\PermissionDeniedException;
use Zend\Diactoros\Response\EmptyResponse;

class AuthController implements ControllerInterface
{
    protected $tags;

    public function __construct(TagRepository $tags)
    {
        $this->tags = $tags;
    }

    public function handle(ServerRequestInterface $request)
    {
        $id = array_get($request->getQueryParams(), 'id');
        $actor = $request->getAttribute('actor');
        $password = array_get($request->getParsedBody(), 'password');

        $tag = $this->tags->findOrFail($id, $actor);

        if ($tag->password && $tag->password !== $password) {
            throw new PermissionDeniedException;
        }

        $request->getAttribute('session')->set('tag_'.$id.'_unlocked', true);

        if (! $actor->isGuest()) {
            $state = $tag->stateFor($actor);
            $state->is_unlocked = true;
            $state->save();
        }

        return new EmptyResponse;
    }
}
