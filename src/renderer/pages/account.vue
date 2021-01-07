<template>
  <div class="account-page">
    <Button type="success" @click.native="login">添加账号</Button>
    <Button type="warning" @click.native="clear">清空账号</Button>
    <Table
      stripe
      style="margin-top: 10px;"
      :columns="columns"
      :data="accountList"
    >
      <template slot-scope="{ row }" slot="name">
        <strong>{{ row.name }}</strong>
      </template>
      <template slot-scope="{ row }" slot="isLogin">
        <strong>{{ row.isLogin ? "是" : "否" }}</strong>
      </template>
      <template slot-scope="{ row }" slot="isPlusMember">
        <strong>{{ row.isPlusMember ? "是" : "否" }}</strong>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <Button
          type="info"
          size="small"
          :disabled="row.isLogin"
          @click="login()"
          >登录</Button
        >
        <Button type="error" size="small" @click="remove(index)">删除</Button>
      </template>
    </Table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
const { BrowserWindow } = require("electron").remote;

export default {
  name: "account",
  data() {
    return {
      columns: [
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "账号",
          key: "name",
          slot: "name"
        },
        {
          title: "登录状态",
          key: "isLogin",
          slot: "isLogin"
        },
        {
          title: "plus会员",
          key: "isPlusMember",
          slot: "isPlusMember"
        },
        {
          title: "操作",
          fixed: "right",
          slot: "action"
        }
      ]
    };
  },
  computed: {
    ...mapGetters("user", ["accountList"])
  },
  created() {
    this.$store.dispatch("user/checkAccountList");
  },
  methods: {
    login() {
      const loginWin = new BrowserWindow({
        width: 800,
        height: 600
      });
      loginWin.loadURL(
        "https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F"
      );
      loginWin.webContents.on("did-navigate", async (event, url) => {
        console.log("did-navigate=================>", url);
        if (url !== "https://www.jd.com/") {
          return;
        }
        let cookies;
        try {
          cookies = await loginWin.webContents.session.cookies.get({
            domain: ".jd.com"
          });
          const cookieStr = cookies.reduce((str, cookie) => {
            const { name, value } = cookie;
            str += `${name}=${value};`;
            return str;
          }, "");
          console.log(
            "did-navigate webContents cookies=================>",
            cookieStr
          );
          loginWin.destroy();
          this.$store.dispatch("user/saveAccount", cookieStr);
          this.$Message.success("账号已添加！");
        } catch (err) {
          console.log(err);
          this.$Message.error("获取Cookies失败！");
        }
      });
    },
    clear() {
      this.$store.commit("user/CLEAR_ALL");
    },
    remove(i) {
      const pinId = this.accountList[i].pinId;
      this.$store.commit("user/REMOVE", pinId);
    }
  }
};
</script>
