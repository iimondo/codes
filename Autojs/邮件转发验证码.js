/**
 * 唤醒并解锁
 * @param {解锁密码} unlockPassword 
 */
function wakeUpAndUnlock(unlockPassword) {
    const keyboard = [];
    if (!device.isScreenOn()) {
        device.wakeUp();
        sleep(4000);
    }

    if (context.getSystemService(context.KEYGUARD_SERVICE).isKeyguardLocked()) {
        gesture(220, [540, 1400], [540, 500]);
        sleep(4000);
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
 * ======================
 * 以下为任务代码
 * ======================
 */

// 解锁
wakeUpAndUnlock("***")

// 接收intent
const intent = engines.myEngine().execArgv.intent
if (intent.action === "com.autojs.intent.RELAY_MSG_CODE") {
    // 遍历所有 extras 值（上面为单个 extra 的读取）
    let extras_obj = {};
    if (intent.extras) {
        let iter = intent.extras.keySet().iterator();
        while (iter.hasNext()) {
            let key = iter.next();
            extras_obj[key] = intent.extras.get(key);
        }
    }

    app.sendEmail({
        email: ["***@qq.com", "***@163.com"],
        subject: "转发收到的验证码",
        text: extras_obj.content
    })
    sleep(5000)

    // 选择邮箱软件
    clickWidget(id('text1_hmct').findOne(), 4000)

    // 点击发送
    id('text_right').findOne().click()
}
