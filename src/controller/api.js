const Base = require('./base.js');

module.exports = class extends Base {
    async indexAction() {
        let data = await this.mongo('message').limit(2).select();
        console.log(data);
        return this.success(data);
    }

    async ipAction() {

        let model = this.mongo('trust_ip');
        if(this.isGet) {
            let data = await model.select();
            if(data && data.length > 0) {
                this.success(data[0]);
            }else{
                this.success([]);
            }
        }else{

            let {ips} = this.post();
            if(ips) {
                await model.where({}).delete();
                let rep =  await model.add({ips:ips});
                this.success(rep);
            }else{
                this.fail('请传入正确参数ips');
            }

        }
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

    async geotopAction() {
        let type = this.get('type')
        let range = this.get('range')

        let result = await this.cache(`${type}${range}`)|| [];
        return this.success(result);
    }

    async topAction() {
        let type = this.get('type')
        let range = this.get('range')
        let result = await this.cache(`${type}${range}`)|| [];
        return this.success(result);
    }

    async geoAction() {
        let type = ['china' , 'world'] // 1表示 中国范围内  0 表示 外国

        let times = this.getTimes();

        for(var i in type) {
            const t = type[i];
            for(var j in times) {
                const time = times[j];

                let start = time.date[0] - 8*3600;
                let end = time.date[1]- 8*3600;
                console.log(time, t);
                let ips = [];
                let data = await this.mongo('trust_ip').select();

                if(data && data.length>0) {
                    ips = data[0].ips;
                }

                let match = {
                    "timestamp": {"$gte": start, "$lte": end },
                    'ipAddr': {"$nin": ips}
                }

                if(t == 'world') {
                    match['country'] = {'$ne': 'China'}
                }else{
                    match['country'] = 'China'
                }


                let result = await this.mongo('message')
                    .aggregate([
                        {
                            "$match": match
                        },
                        {
                            "$group":
                                {
                                    "_id": "$city",
                                    "lag": {"$first": "$lng"},
                                    "lat": {"$first": "$lat"},
                                    "country": {"$first": "$country"},
                                    "region": {"$first": "$region"},
                                    "count":{"$sum": 1}
                                }
                        },
                        {"$sort": {"count": -1}}, {"$limit": 100 }],{allowDiskUse: true});

                await this.cache(`${t}${time.name}`, result);
                console.log(result);
            }
        }

    }


    async runAction() {
        let type = ['ipAddr', 'fromAddr', 'toAddr'];
        let times = this.getTimes();

        for(var i in type) {
            const t = type[i];
            for(var j in times) {
                const time = times[j];

                let start = time.date[0] - 8*3600;
                let end = time.date[1]- 8*3600;
                console.log(time, t);
                let ips = [];
                let data = await this.mongo('trust_ip').select();

                if(data && data.length>0) {
                    ips = data[0].ips;
                }

                let result = await this.mongo('message')
                    .aggregate([{"$match": {"timestamp": {"$gte": start, "$lte": end }, 'ipAddr': {"$nin": ips}}}, {"$group": {"_id": "$" + t, "count":{"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 10 }],{allowDiskUse: true});
                await this.cache(`${t}${time.name}`, result);
                console.log(result);
            }
        }
    }


    getTimes() {
        let end = new Date().valueOf()/1000;
        return [{name: 'hour',date:[end - 3600, end]}, {name: 'day', date:[end - 7* 24 * 3600,end]}, {name: 'week', date:[end - 24* 24 * 3600,end]}, {name: 'month', date:[end - 30* 24 * 3600,end]}]
        // return [{name: 'hour',date:[end - 1130* 24 * 3600, end]}]
    }

};
