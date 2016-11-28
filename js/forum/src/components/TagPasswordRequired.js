import app from 'flarum/app';
import Component from 'flarum/Component';

export default class TagPasswordRequired extends Component {
  init() {
    this.password = m.prop('');
    this.loading = false;
    this.invalid = false;
  }

  view() {
    const invalid = this.invalid;
    this.invalid = false;

    return (
      <form onsubmit={this.onsubmit.bind(this)} className="TagPasswordRequired">
        <h3>{app.translator.trans('tobscure.tag_passwords::forum.tag_password_required.title')}</h3>
        <input type="password" className={'FormControl'+(invalid ? ' invalid' : '')} bidi={this.password} disabled={this.loading}/>
      </form>
    );
  }

  config(isInitialized) {
    super.config(...arguments);

    if (!isInitialized) this.$('input').focus();
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/tags/' + this.props.tag.id() + '/auth',
      data: {password: this.password},
      errorHandler: error => {
        if (error.status !== 401) throw error;
      }
    }).then(
      payload => {
        this.props.tag.pushAttributes({isUnlocked: true});
        if (app.cache.discussionList) app.cache.discussionList.refresh();
      },
      response => {
        this.$('input').select();
        this.invalid = true;
      }
    ).then(() => {
      this.loading = false;
      m.redraw();
    });
  }
}

