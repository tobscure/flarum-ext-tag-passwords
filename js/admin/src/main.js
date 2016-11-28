import { extend } from 'flarum/extend';
import app from 'flarum/app';

import Tag from 'flarum/tags/models/Tag';
import EditTagModal from 'flarum/tags/components/EditTagModal';

app.initializers.add('tobscure/tag-passwords', () => {
  Tag.prototype.isPasswordProtected = Tag.attribute('isPasswordProtected');
  Tag.prototype.password = Tag.attribute('password');

  extend(EditTagModal.prototype, 'init', function() {
    this.isPasswordProtected = m.prop(this.tag.password() || false);
    this.password = m.prop(this.tag.password() || '');
  });

  extend(EditTagModal.prototype, 'content', function(vdom) {
    vdom.children[0].children.splice(5, 0,
      <div className="Form-group">
        <div>
          <label className="checkbox">
            <input type="checkbox" value="1" bidi={this.isPasswordProtected}/>
            {app.translator.trans('tobscure.tag_passwords::admin.edit_tag.password_protected_label')}
          </label>
          {this.isPasswordProtected() ? <input type="text" bidi={this.password} className="FormControl"/> : ''}
        </div>
      </div>
    );
  });

  extend(EditTagModal.prototype, 'submitData', function(data) {
    data.password = this.isPasswordProtected() ? this.password() : null;
  })
});
