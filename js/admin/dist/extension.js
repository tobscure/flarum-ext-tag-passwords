'use strict';

System.register('tobscure/tag-passwords/main', ['flarum/extend', 'flarum/app', 'flarum/tags/models/Tag', 'flarum/tags/components/EditTagModal'], function (_export, _context) {
  "use strict";

  var extend, app, Tag, EditTagModal;
  return {
    setters: [function (_flarumExtend) {
      extend = _flarumExtend.extend;
    }, function (_flarumApp) {
      app = _flarumApp.default;
    }, function (_flarumTagsModelsTag) {
      Tag = _flarumTagsModelsTag.default;
    }, function (_flarumTagsComponentsEditTagModal) {
      EditTagModal = _flarumTagsComponentsEditTagModal.default;
    }],
    execute: function () {

      app.initializers.add('tobscure/tag-passwords', function () {
        Tag.prototype.isPasswordProtected = Tag.attribute('isPasswordProtected');
        Tag.prototype.password = Tag.attribute('password');

        extend(EditTagModal.prototype, 'init', function () {
          this.isPasswordProtected = m.prop(this.tag.password() || false);
          this.password = m.prop(this.tag.password() || '');
        });

        extend(EditTagModal.prototype, 'content', function (vdom) {
          vdom.children[0].children.splice(5, 0, m(
            'div',
            { className: 'Form-group' },
            m(
              'div',
              null,
              m(
                'label',
                { className: 'checkbox' },
                m('input', { type: 'checkbox', value: '1', bidi: this.isPasswordProtected }),
                app.translator.trans('tobscure.tag_passwords::admin.edit_tag.password_protected_label')
              ),
              this.isPasswordProtected() ? m('input', { type: 'text', bidi: this.password, className: 'FormControl' }) : ''
            )
          ));
        });

        extend(EditTagModal.prototype, 'submitData', function (data) {
          data.password = this.isPasswordProtected() ? this.password() : null;
        });
      });
    }
  };
});