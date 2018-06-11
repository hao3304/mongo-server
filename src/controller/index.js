const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    return this.success("请访问接口");
  }

};
