const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {

    let data = await this.model('message').limit(10).select();
    console.log(data);
    return this.display();
  }
};
