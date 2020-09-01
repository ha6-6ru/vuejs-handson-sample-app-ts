<template>
  <v-footer v-if="signInUser" app class="pa-0">
    <v-bottom-navigation grow dark>
      <v-btn class="my-auto" height="56" @click="routerPush('/')">
        <span>home</span>
        <v-icon large>home</v-icon>
      </v-btn>
      <v-btn class="my-auto" height="56" @click="routerPush('/calendar/day')">
        <span>daily</span>
        <v-icon large>view_day</v-icon>
      </v-btn>
      <v-btn class="my-auto" height="56" @click="routerPush('/calendar/week')">
        <span>weekly</span>
        <v-icon large>view_week</v-icon>
      </v-btn>
      <v-btn class="my-auto" height="56" @click="routerPush('/calendar/month')">
        <span>monthly</span>
        <v-icon large>event_note</v-icon>
      </v-btn>
      <v-menu top open-on-hover offset-y>
        <template v-slot:activator="{ on }">
          <div :class="$style.profile" class="py-1 px-1 text-center" v-on="on">
            <v-avatar :color="signInUser.themeColor">
              <span class="white--text body-2" v-text="signInUser.nickname" />
            </v-avatar>
          </div>
        </template>
        <v-card>
          <v-list>
            <v-list-item
              v-for="(item, index) in items"
              :key="index"
              link
              @click="handleMethod(item.methodName)"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.title" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-card-actions>
            <v-btn block @click="signOut">サインアウト</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-bottom-navigation>
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { profileStore } from '@/store/profile/profile';

@Component
export default class FooterComponent extends Vue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  /**
   * サブメニューアイテム
   */
  private items = [
    { title: 'プロフィール', icon: 'account_circle', methodName: 'profile' },
    { title: '共有する', icon: 'share', methodName: 'share' },
  ];

  /**
   * サインインしているユーザー
   */
  private get signInUser() {
    return profileStore.getProfile;
  }

  /**
   * メソッド名を指定してコンポーネントのメソッドを呼び出します。
   * @param {string} methodName 呼び出すメソッド名
   */
  private handleMethod(methodName: string) {
    this[methodName]();
  }

  /**
   * 指定したパスに画面遷移を行います。
   * @param {string} path 遷移先のパス
   */
  private routerPush(path: string) {
    this.$router.push(
      path,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  /**
   * プロフィール画面に遷移します。
   */
  private profile() {
    this.routerPush('/profile');
  }

  /**
   * 共有画面に遷移します。
   */
  private share() {
    this.routerPush('/share');
  }

  /**
   * サインアウトします。
   */
  private signOut() {
    profileStore.clearProfile();
    this.routerPush('/sign-in');
  }
}
</script>

<style lang="scss" module>
.profile {
  cursor: pointer;
  width: 168px;
}
</style>
