<template>
  <div class="task-page">
    <Row>
      <Input
        style="margin-bottom: 10px;"
        type="text"
        v-model="inputUrl"
        placeholder="输入京东商品抢购链接"
      />
    </Row>
    <Row>
      <Col span="16">
        <Button type="info" @click.native="addProduct">添加商品</Button>
        <Button type="warning" @click.native="clearAllProduct">清空商品</Button>
      </Col>
      <Col span="8">
        <Row type="flex" justify="end">
          <Input
            type="number"
            style="padding-right: 10px;width: 200px;"
            v-model="taskInterval"
            value="100"
          >
            <span slot="prepend">抢购间隔</span>
            <span slot="append">毫秒</span>
          </Input>
          <Button type="error" @click.native="stopAll">全部停止</Button>
        </Row>
      </Col>
    </Row>
    <List style="margin-top: 10px;" border>
      <ListItem
        v-for="item in this.productList"
        :key="item.skuId"
        style="background-color: #ffffff;"
      >
        <ListItemMeta
          :avatar="item.skuImgUrl"
          :title="item.skuName"
          :description="item.skuPrice + '￥ - ' + item.color"
        />
        <template slot="action">
          <li>
            <Button
              type="primary"
              size="small"
              @click="createOrders(item.skuId, item.skuName, 1)"
              >开抢</Button
            >
          </li>
          <li>
            <Button type="warning" size="small" @click="stopTask(item.skuId)"
              >停止</Button
            >
          </li>
          <li>
            <Button type="error" size="small" @click="removeProduct(item.skuId)"
              >删除</Button
            >
          </li>
        </template>
      </ListItem>
    </List>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
const api = require("electron").remote.require("./api").default;

export default {
  name: "task",
  data() {
    return {
      timers: [],
      inputUrl: "",
      taskInterval: 500
    };
  },
  computed: {
    ...mapGetters("user", ["accountList"]),
    ...mapGetters("product", ["productList"])
  },
  methods: {
    async addProduct() {
      if (!this.inputUrl) {
        this.$Message.warning("请输入链接");
        return;
      }
      const urlMatch = this.inputUrl.match(/jd\.com\/(\d+)\.html/);
      const skuId = urlMatch ? urlMatch[1] : false;
      if (skuId) {
        let hasLogin = false;
        for (let i = 0; i < this.accountList.length; i++) {
          if (this.accountList[i].isLogin) {
            const buyInfo = await api.jd.getBuyInfo(
              this.accountList[i].cookie,
              skuId,
              1
            );
            const skuInfo = buyInfo["seckillSkuVO"];
            this.$Message.info("添加商品：" + skuInfo.skuName);
            await this.$store.commit("product/SAVE_OR_UPDATE", {
              skuId,
              skuImgUrl: "http://img13.360buyimg.com/n6/" + skuInfo.skuImgUrl,
              skuName: skuInfo.skuName,
              skuPrice: skuInfo.skuPrice,
              color: skuInfo.color
            });
            hasLogin = true;
            break;
          }
        }
        if (!hasLogin) {
          this.$Message.error("没有登陆账户，无法添加商品");
        }
      } else {
        this.$Message.warning(`链接无法识别：${this.inputUrl}`);
      }
    },
    removeProduct(skuId) {
      this.$store.commit("product/REMOVE", skuId);
    },
    clearAllProduct() {
      this.$store.commit("product/CLEAR_ALL");
    },
    createOrders(skuId, name, num = 1) {
      this.$Message.info(`开始抢购${name}`);
      this.$Notice.open({
        name: "task_start_notice",
        title: `抢购运行中......`,
        desc: `当前抢购进程数${this.timers.length + 1}~`
      });
      for (let i = 0; i < this.accountList.length; i++) {
        if (this.accountList[i].isLogin) {
          let task = setInterval(() => {
            this.createOrder(
              this.accountList[i].cookie,
              skuId,
              num,
              this.accountList[i].pinId,
              this.accountList[i].name
            );
          }, this.taskInterval);
          this.timers.push({
            pinId: this.accountList[i].pinId,
            skuId: skuId,
            task
          });
        } else {
          this.$Message.info(this.accountList[i] + "账号未登录，跳过抢购。");
        }
      }
    },
    async createOrder(cookie, skuId, num, pinId, name) {
      try {
        const buyInfo = await api.jd.getBuyInfo(cookie, skuId, num);
        if (!buyInfo) return;
        const submitResult = await api.jd.orderSubmit(
          cookie,
          skuId,
          num,
          buyInfo
        );
        // console.log(buyInfo, submitResult);
        if (submitResult && submitResult.success) {
          this.stopTask(skuId, pinId);
          this.$Notice.open({
            title: `恭喜,账号「${name}」抢购成功！`,
            desc: `商品： ${buyInfo["seckillSkuVO"].skuName}，订单ID：${submitResult.orderId} `,
            duration: 0
          });
        } else if (submitResult && submitResult.errorMessage) {
          this.$Message.info(submitResult.errorMessage);
        } else {
          this.$Message.info("抢购失败，还未到时间");
        }
      } catch (e) {
        console.log(e.message);
      } finally {
        if (this.timers.length === 0) {
          this.$Notice.close("task_start_notice");
        }
      }
    },
    stopAll() {
      for (let i = 0; i < this.timers.length; i++) {
        let task = this.timers[i].task;
        clearInterval(task);
      }
      this.timers = [];
    },
    stopTask(skuId, pinId) {
      for (let i = 0; i < this.timers.length; i++) {
        if (
          this.timers[i].skuId === skuId &&
          (!pinId || this.timers[i].pinId === pinId)
        ) {
          clearInterval(this.timers[i].task);
          this.timers.splice(i, 1);
          i--;
        }
      }
    }
  }
};
</script>
