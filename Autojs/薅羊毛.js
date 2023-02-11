/**
 * 等待...
 * @param {activity className} activity 
 * @param {时间} period 
 * @param {时间} timeout 
 * @returns 结果
 */
function waitForActivity(activity, period, timeout) {
    period = period || 200
    timeout = timeout || 20000
    const startTime = new Date().getTime()
    while (currentActivity() !== activity) {
        if (new Date().getTime() - startTime >= timeout) {
            return false
        }
        sleep(period)
    }

    return true
}

/**
 * 根据包名获取应用
 * @param {包名} packageName 
 * @returns 包含方法的对象
 */
function getAppByPackageName(packageName) {
    if (!packageName) toast('缺少包名')
    return {
        launch() {
            launch(packageName)
            sleep(1000)
            if (currentPackage() === 'com.miui.securitycenter') {
                click('允许')
            }
        },
        close() {
            sleep(2000)
            app.openAppSetting(packageName)
            text(app.getAppName(packageName)).waitFor()
            const isSure = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne()
            if (isSure.enabled()) {
                // textMatches(/.*停止.*/).findOne().click()
                const finish = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne()
                click(finish.bounds().centerX(), finish.bounds().centerY())

                textMatches(/(.*确.*|.*定.*)/).findOne().click()
                log(app.getAppName(packageName) + '应用已被关闭')
                sleep(1000)
                back()
            } else {
                log(app.getAppName(packageName) + '应用不能被正常关闭或不在后台运行')
                back()
            }
        }
    }
}

/**
 * 某些组件的clickable为false的情况下使用
 * @param {点击的控件} widget 
 * @param {点击后的延迟} delay
 */
function clickWidget(widget, delay) {
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY())
        sleep(delay)
    }
}

/**
 * 唤醒并解锁
 * @param {解锁密码} unlockPassword 
 */
function wakeUpAndUnlock(unlockPassword) {
    const keyboard = [];
    if (!device.isScreenOn()) {
        device.wakeUp();
        sleep(2000);
    }

    if (context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked()) {
        gesture(220, [540, 1400], [540, 500]);
        sleep(2000);
        for (let i = 0; i < 10; i++) {
            keyboard.push(id('key' + i).findOnce());
        }

        for (let i = 0; i < unlockPassword.length; i++) {
            keyboard[+unlockPassword[i]].click();
            sleep(500);
        }

        sleep(1000);
    }
}


/**
 * ======================
 * 以下为任务代码
 * ======================
 */
const tasks = [
    {
        name: "联通签到获取流量",
        run: function () {
            // 启动应用
            const app = getAppByPackageName('com.sinovatech.unicom.ui')
            app.launch()
            waitForActivity('com.sinovatech.unicom.basic.ui.activity.MainActivity')
            sleep(2 * 1000)

            // 1.进入"老用户专区"
            clickWidget(text("老用户专区").findOne(), 4000)

            // 2.进入"领取特惠福利"
            click(350, 1226) // 关闭广告
            click(638, 910) // "按键"
            sleep(4000)

            // 3.滑动到底部
            for (var i = 0; i < 4; i++) swipe(387, 1125, 387, 300, 200)
            // 点击"马上签到", 进入签到页
            click(365, 813)
            sleep(4000)

            // 4.点击"领取"
            click(350, 879) // “领取”按键
            sleep(10 * 1000) // 暂停10秒, 等待短信
            // tasker 写入验证码到 tk-temp.js
            const tk_temp = require('./tk-temp');
            input(0, tk_temp.code)
            // 点击办理
            clickWidget(text("确定办理").findOne(), 5000)

            console.log("短信验证码: " + tk_temp.code)
            app.close()
        }
    },
    {
        name: "联通积分签到",
        run: function () {
            // 1.启动应用
            const app = getAppByPackageName('com.sinovatech.unicom.ui')
            app.launch()
            waitForActivity('com.sinovatech.unicom.basic.ui.activity.MainActivity')
            sleep(2 * 1000)

            // 2.执行点击
            clickWidget(id('home_qiandao_image').findOne(), 2000)

            app.close()
        }
    },
    {
        name: "云闪付积分签到",
        run: function () {
            // 1.启动应用
            const app = getAppByPackageName('com.unionpay')
            app.launch()
            waitForActivity('com.unionpay.activity.UPActivityMain')
            sleep(1000)

            // 2.执行点击
            clickWidget(id('float_view').findOne(), 2000)

            // 3.点击签到
            clickWidget(className('Button').text('立即签到').findOne(), 2000)

            app.close()
        }
    },
    {
        name: "拼多多签到",
        run: function () {
            // 1.启动应用
            const app = getAppByPackageName('com.xunmeng.pinduoduo')
            app.launch()
            waitForActivity('com.xunmeng.pinduoduo.ui.activity.HomeActivity')
            sleep(1000)

            // 2.点击进入签到页面
            clickWidget(text('签到').findOne(), 5000)

            // 3. 签到
            // TODO: clickWidget(text('立即签到').findOne(), 2000)
            app.close()
        }
    },
    {
        name: "拼多多看小说",
        run: function () {
            // 1.启动应用
            const app = getAppByPackageName('com.xunmeng.pinduoduo')
            app.launch()
            waitForActivity('com.xunmeng.pinduoduo.ui.activity.HomeActivity')
            sleep(1000)

            // 2.点击进入签到页面
            clickWidget(text('签到').findOne(), 5000)

            // 3. 进入看小说
            clickWidget(text('看小说赚钱').findOne(), 5000)

            // 4. 滑动阅读
            var current = 0
            var intervalID = setInterval(function () {

                //  关闭其他提示
                if (className('LinearLayout').depth(1).exists()) {
                    //clickWidget(className('LinearLayout').depth(1).findOne(), 1000)
                }

                gesture(200, [600, 700], [150, 700])

                if (current > 3600) { // 阅读15分钟
                    clearInterval(intervalID)
                    app.close()
                }

                current = current + 6
            }, 6 * 1000)
        }
    },
    {
        name: "抖音签到",
        run: function(){

        }
    },
    {
        name: "抖音看视频任务",
        run: function(){
            // 1.启动应用
            const app = getAppByPackageName('com.ss.android.ugc.aweme.lite')
            app.launch()
            waitForActivity('com.ss.android.ugc.aweme.main.MainActivity')
            sleep(10000) 
            
            // 2. 观看视频
            var count = 0
            var intervalID = setInterval(function () {

                //  关闭其他提示
                //if (className('LinearLayout').depth(1).exists()) {
                    //clickWidget(className('LinearLayout').depth(1).findOne(), 1000)
                //}

                gesture(200, [400, 1100], [400, 300])

                if (count > 32400) { // 刷2小时视频
                    clearInterval(intervalID)
                    app.close()
                }

                count = count + 1
            }, 15 * 1000)
        }
    }
]

// 运行所有任务
tasks.filter((task) => [
    // "联通签到获取流量",
    // "联通积分签到",
    // "云闪付积分签到",
    // "拼多多签到",
    // "拼多多看小说",
    "抖音看视频任务"
].indexOf(task.name) !== -1)
    .forEach(task => {
        // 1. 解锁屏幕
        wakeUpAndUnlock("***")
        sleep(1000)

        // 2. 运行任务
        console.log("\n=============\nSTART: " + task.name)
        task.run()
        console.log("\nEND: " + task.name + "\n=============")

    });