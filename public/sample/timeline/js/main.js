var vm;

$(document).ready(function() {
    vm = {
        width: 754,
        itemHeight: 160,
        rowHeight: 14,
        timeStep: ko.observable('3M'),
        startTime: ko.observable(),
        endTime: ko.observable(),
        operator: ko.observable(),
        packageCode: ko.observable(),
        packageName: ko.observable(),
        startTimeValue: ko.pureComputed(function() {
            return this.startTime().valueof();
        }),
        startTimeText: ko.pureComputed(function() {
            return this.startTime().format('l');
        }),
        endTimeText: ko.pureComputed(function() {
            return this.endTime().format('l');
        }),
        totalTimeValue: ko.observable(),
        myItems: ko.observableArray([]),
        myScales: ko.observableArray([]),
        myBigScales: ko.observableArray([]),
        changeTimeStep: function() {
            if (this.timeStep().match(/1M|3M|1Y/)) {
                $('#timeFrom').datebox('setValue', '');
                $('#timeTo').datebox('setValue', '');
                $('#timeFrom').datebox({'disabled': true});
                $('#timeTo').datebox({'disabled': true});
            } else {
                $('#timeFrom').datebox({'disabled': false});
                $('#timeTo').datebox({'disabled': false});
            }
            return true;
        },
        search: function() {
            var start;
            var end;
            if (this.timeStep() == '1M' || this.timeStep() == '3M' || this.timeStep() == '1Y') {
                end = moment();
                if (this.timeStep() == '1M') {
                    start = moment().subtract(1, 'months');
                } else if (this.timeStep() == '3M') {
                    start = moment().subtract(3, 'months');
                } else if (this.timeStep() == '1Y') {
                    start = moment().subtract(1, 'years');
                }
                this.endTime(end);
                this.startTime(start);
                this.totalTimeValue(end.valueOf() - start.valueOf());
            } else if (this.timeStep() == 'DIY') {
                end = moment($('#timeTo').datebox('getValue'));
                start = moment($('#timeFrom').datebox('getValue'));
                if (end == start) {
                    start = moment().subtract(1, 'days');
                }
                this.endTime(end);
                this.startTime(start);
                this.totalTimeValue(end.clone().add(1, 'days').valueOf() - start.valueOf());
            } else {
                return;
            }

            $.get('data.json', function(data) {
                var days;
                var dd = 86400000;
                var n;
                var m;
                vm.myScales.removeAll();
                vm.myBigScales.removeAll();
                if (vm.totalTimeValue() == dd) {
                    // 1天，2小时一个刻度
                    for (var i = 0; i <= 24; i = i + 2) {
                        vm.myScales.push({
                            value: i / 24 * vm.width,
                            text: vm.startTime().clone().add(i, 'hours').format('H:00')
                        });
                    }
                    // 大刻度
                    vm.myBigScales.push({value: 0, text: vm.startTime().format('YYYY年M月D日')});
                    vm.myBigScales.push({
                        value: vm.width,
                        text: vm.startTime().clone().add(1, 'days').format('YYYY年M月D日')
                    });
                } else if (vm.totalTimeValue() <= dd * 10) {
                    //10天以下, 1天一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        vm.myScales.push({
                            value: i / days * vm.width,
                            text: n + '日'
                        });

                        if (n == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年M月')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().format('YYYY年M月')});
                    }
                } else if (vm.totalTimeValue() <= dd * 21) {
                    //21天以下，2天一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        if (n % 2 == 1 && n != 31) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: n + '日'
                            });
                        }
                        if (n == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年M月')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().format('YYYY年M月')});
                    }
                } else if (vm.totalTimeValue() <= dd * 62) {
                    //2个月以下，5天一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        if (n % 5 == 1 && n != 31) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: n + '日'
                            });
                        }
                        if (n == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年M月')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().format('YYYY年M月')});
                    }
                } else if (vm.totalTimeValue() <= dd * 92) {
                    //3个月以下，5天一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        if (n % 10 == 1 && n != 31) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: n + '日'
                            });
                        }
                        if (n == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年M月')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().format('YYYY年M月')});
                    }
                } else if (vm.totalTimeValue() <= dd * 366) {
                    //1年以下，1月一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        if (n == 1) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('M') + '月'
                            });
                        }
                        if (vm.startTime().clone().add(i, 'days').format('DDD') == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().clone().format('YYYY年')});
                    }
                } else if (vm.totalTimeValue() <= dd * (366 + 365 * 2)) {
                    //3年以下，3月一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('D');
                        m = vm.startTime().clone().add(i, 'days').format('M');
                        if (n == 1 && m % 3 == 1) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: m + '月'
                            });
                        }
                        if (vm.startTime().clone().add(i, 'days').format('DDD') == '1') {
                            vm.myBigScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年')
                            });
                        }
                    }
                    if (vm.myBigScales().length == 0) {
                        vm.myBigScales.push({value: 0, text: vm.startTime().clone().format('YYYY年')});
                    }
                } else if (vm.totalTimeValue() <= dd * 365.25 * 10) {
                    //10年以下，1年一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {
                        n = vm.startTime().clone().add(i, 'days').format('DDD');
                        if (n == 1) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: vm.startTime().clone().add(i, 'days').format('YYYY年')
                            });
                        }
                    }
                } else {
                    //10年以上，5年一个刻度
                    days = vm.totalTimeValue() / dd;
                    for (var i = 0; i <= days; i++) {

                        n = vm.startTime().clone().add(i, 'days').format('DDD');
                        m = vm.startTime().clone().add(i, 'days').format('YYYY');

                        if (n == 1 && m.match(/\d+[05]$/)) {
                            vm.myScales.push({
                                value: i / days * vm.width,
                                text: m + '年'
                            });
                        }
                    }
                }
                vm.myItems.removeAll();

                // 循环【和前一次X值做比较，小于10的就与前一次合并】
                for (var i = 0; i < data.length; i++) {
                    data[i].x = (moment(data[i].time).valueOf() - vm.startTime().valueOf()) / vm.totalTimeValue() * vm.width + 44;
                    if (data[i].type == 'in') {
                        data[i].y = 290;
                    } else {
                        data[i].y = 50;
                    }
                }

                // in out 各自排序
                var groupData = _.groupBy(data, function(item) {
                    return item.type;
                });
                var typeArr = ['in', 'out'];
                var typeData;
                var tempX = 0;
                for (var j = 0; j < typeArr.length; j++) {
                    typeData = _.sortBy(groupData[typeArr[j]], function(item) {
                        return item.time
                    });
                    tempX = 0;
                    for (var i = 0; i < typeData.length; i++) {
                        if (typeData[i].x - tempX < 10) {
                            typeData[i].x = tempX + 10;
                        }
                        tempX = typeData[i].x;
                        vm.myItems.push(typeData[i]);
                    }
                }
            });
        },
        highlight: function (evt) {
            $('.record').removeClass('highlight');
            $(evt.target).parent('div.record').addClass('highlight');
        },
        unhighlight: function (evt) {
            $(evt.target).removeClass('highlight');
        }
    };

    ko.applyBindings(vm, document.getElementById('timeline'));
    $('[name=search]').click();
});

function myformatter(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10
        ? ('0' + m)
        : m) + '-' + (d < 10
        ? ('0' + d)
        : d);
}

function myparser(s) {
    if (!s)
        return new Date();
    var ss = (s.split('-'));
    var y = parseInt(ss[0], 10);
    var m = parseInt(ss[1], 10);
    var d = parseInt(ss[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d);
    } else {
        return new Date();
    }
}
