import { extend } from 'flarum/extend';
import app from 'flarum/app';
import IndexPage from 'flarum/components/IndexPage';
import icon from 'flarum/helpers/icon';

import Tag from 'flarum/tags/models/Tag';
import TagLinkButton from 'flarum/tags/components/TagLinkButton';

import TagPasswordRequired from 'tobscure/tag-passwords/components/TagPasswordRequired';

app.initializers.add('tobscure/tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Tag.attribute('isPasswordProtected');
  Tag.prototype.isUnlocked = Tag.attribute('isUnlocked');
  Tag.prototype.password = Tag.attribute('password');

  extend(IndexPage.prototype, 'view', function(vdom) {
    const tag = this.currentTag();

    if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
      vdom.children[1].children[1].children = [<TagPasswordRequired tag={tag}/>];
    }
  });

  extend(IndexPage.prototype, 'sidebarItems', function(items) {
    const tag = this.currentTag();

    if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
      const item = items.get('newDiscussion');
      item.props.children = app.translator.trans('core.forum.index.cannot_start_discussion_button');
      item.props.disabled = true;
    }
  });

  extend(TagLinkButton.prototype, 'view', function(vdom) {
    if (this.props.tag.isPasswordProtected() && !this.props.tag.isUnlocked()) {
      vdom.children.push(icon('lock'));
    }
  });
});
