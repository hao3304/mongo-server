const Base = require('./base.js');

module.exports = class extends Base {
    async indexAction() {
        let data = await this.mongo('message').limit(2).select();
        console.log(data);
        return this.display();
    }

    async searchAction() {
        let where = {};
        let toAddr = this.get('toAddr');
        let begin = this.get('begin');
        let end = this.get('end');
        let ipAddr = this.get('ipAddr');
        let fromAddr = this.get('fromAddr');
        let page = this.get('page')|| 1;
        let status = this.get('status')|| 'sent';
        if(toAddr) {
          where['toAddr'] = toAddr;
        }
        if(status) {
          where['status'] = status;
        }
        if(ipAddr) {
            where['ipAddr'] = ipAddr;
        }
        if(fromAddr) {
            where['fromAddr'] = fromAddr;
        }
        if(begin&&end) {
          where['timestamp'] = {"$gte": parseInt(begin), "$lte": parseInt(end)};
        }
        console.log(where)
        let data = await this.mongo('message').order({'timestamp':-1}).where(where).page(page,20).countSelect();
        return this.success(data);
    }

    async topAction() {
        let type = this.get('type')
        let range = this.get('range')
        let k = this.get('k') || 10;

        if(["ipAddr", "fromAddr", "toAddr"].indexOf(type) == -1) {
            return this.fail('type must in "idAddr, fromAddr, toAddr"');
        }

        let end = new Date().valueOf()/1000;
        let start;
        switch (type) {
            case 'day':
                start = end - 24 * 3600;
                break;
            case 'week':
                start = end - 7 * 24 * 3600;
                break;
            case 'month':
                start = end - 30 * 24 * 3600;
                break;
            default:
                start = end - 3600;
        }

        let result = await this.mongo('message')
            .aggregate([{"$match": {"timestamp": {"$gte": start, "$lte": end }}}, {"$group": {"_id": "$" + type, "count":{"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": k}])
            .select();

        return this.success(result);
    }


};
