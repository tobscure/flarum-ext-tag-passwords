'use strict';

System.register('tobscure/tag-passwords/components/TagPasswordRequired', ['flarum/app', 'flarum/Component'], function (_export, _context) {
  "use strict";

  var app, Component, TagPasswordRequired;
  return {
    setters: [function (_flarumApp) {
      app = _flarumApp.default;
    }, function (_flarumComponent) {
      Component = _flarumComponent.default;
    }],
    execute: function () {
      TagPasswordRequired = function (_Component) {
        babelHelpers.inherits(TagPasswordRequired, _Component);

        function TagPasswordRequired() {
          babelHelpers.classCallCheck(this, TagPasswordRequired);
          return babelHelpers.possibleConstructorReturn(this, (TagPasswordRequired.__proto__ || Object.getPrototypeOf(TagPasswordRequired)).apply(this, arguments));
        }

        babelHelpers.createClass(TagPasswordRequired, [{
          key: 'init',
          value: function init() {
            this.password = m.prop('');
            this.loading = false;
            this.invalid = false;
          }
        }, {
          key: 'view',
          value: function view() {
            var invalid = this.invalid;
            this.invalid = false;

            return m(
              'form',
              { onsubmit: this.onsubmit.bind(this), className: 'TagPasswordRequired' },
              m(
                'h3',
                null,
                app.translator.trans('tobscure.tag_passwords::forum.tag_password_required.title')
              ),
              m('input', { type: 'password', className: 'FormControl' + (invalid ? ' invalid' : ''), bidi: this.password, disabled: this.loading })
            );
          }
        }, {
          key: 'config',
          value: function config(isInitialized) {
            babelHelpers.get(TagPasswordRequired.prototype.__proto__ || Object.getPrototypeOf(TagPasswordRequired.prototype), 'config', this).apply(this, arguments);

            if (!isInitialized) this.$('input').focus();
          }
        }, {
          key: 'onsubmit',
          value: function onsubmit(e) {
            var _this2 = this;

            e.preventDefault();

            this.loading = true;

            app.request({
              method: 'POST',
              url: app.forum.attribute('apiUrl') + '/tags/' + this.props.tag.id() + '/auth',
              data: { password: this.password },
              errorHandler: function errorHandler(error) {
                if (error.status !== 401) throw error;
              }
            }).then(function (payload) {
              _this2.props.tag.pushAttributes({ isUnlocked: true });
              if (app.cache.discussionList) app.cache.discussionList.refresh();
            }, function (response) {
              _this2.$('input').select();
              _this2.invalid = true;
            }).then(function () {
              _this2.loading = false;
              m.redraw();
            });
          }
        }]);
        return TagPasswordRequired;
      }(Component);

      _export('default', TagPasswordRequired);
    }
  };
});;
'use strict';

System.register('tobscure/tag-passwords/main', ['flarum/extend', 'flarum/app', 'flarum/components/IndexPage', 'flarum/helpers/icon', 'flarum/tags/models/Tag', 'flarum/tags/components/TagLinkButton', 'tobscure/tag-passwords/components/TagPasswordRequired'], function (_export, _context) {
  "use strict";

  var extend, app, IndexPage, icon, Tag, TagLinkButton, TagPasswordRequired;
  return {
    setters: [function (_flarumExtend) {
      extend = _flarumExtend.extend;
    }, function (_flarumApp) {
      app = _flarumApp.default;
    }, function (_flarumComponentsIndexPage) {
      IndexPage = _flarumComponentsIndexPage.default;
    }, function (_flarumHelpersIcon) {
      icon = _flarumHelpersIcon.default;
    }, function (_flarumTagsModelsTag) {
      Tag = _flarumTagsModelsTag.default;
    }, function (_flarumTagsComponentsTagLinkButton) {
      TagLinkButton = _flarumTagsComponentsTagLinkButton.default;
    }, function (_tobscureTagPasswordsComponentsTagPasswordRequired) {
      TagPasswordRequired = _tobscureTagPasswordsComponentsTagPasswordRequired.default;
    }],
    execute: function () {

      app.initializers.add('tobscure/tag-passwords', function () {
        Tag.prototype.isPasswordProtected = Tag.attribute('isPasswordProtected');
        Tag.prototype.isUnlocked = Tag.attribute('isUnlocked');
        Tag.prototype.password = Tag.attribute('password');

        extend(IndexPage.prototype, 'view', function (vdom) {
          var tag = this.currentTag();

          if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
            vdom.children[1].children[1].children = [m(TagPasswordRequired, { tag: tag })];
          }
        });

        extend(IndexPage.prototype, 'sidebarItems', function (items) {
          var tag = this.currentTag();

          if (tag && tag.isPasswordProtected() && !tag.isUnlocked()) {
            var item = items.get('newDiscussion');
            item.props.children = app.translator.trans('core.forum.index.cannot_start_discussion_button');
            item.props.disabled = true;
          }
        });

        extend(TagLinkButton.prototype, 'view', function (vdom) {
          if (this.props.tag.isPasswordProtected() && !this.props.tag.isUnlocked()) {
            vdom.children.push(icon('lock'));
          }
        });
      });
    }
  };
});