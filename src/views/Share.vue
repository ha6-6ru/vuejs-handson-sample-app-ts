<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="4" class="text-center">
      <p class="display-1 py-12">共有する</p>
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="partOfNickname"
            clearable
            flat
            hide-details
            prepend-inner-icon="search"
            label="ニックネーム"
          />
        </v-card-text>
        <v-fade-transition group>
          <v-list-item v-for="(user, index) in filteredUsers" :key="index">
            <v-list-item-icon>
              <v-avatar :color="user.themeColor" size="48">
                <span class="white--text body-2" v-text="user.nickname" />
              </v-avatar>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="text-left" v-text="user.nickname" />
              <v-list-item-subtitle class="text-left" v-text="user.userName" />
            </v-list-item-content>
            <v-list-item-action>
              <v-btn color="primary" @click="share(user.userId)">
                共有する
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-fade-transition>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { searchUsers } from '@/store/shared-user';

@Component
export default class ShareComponent extends Vue {
  /**
   * 検索に使用するユーザーのニックネームの一部
   */
  private partOfNickname: string | null = null;

  /**
   * フィルタリングしたユーザーを取得します。
   */
  private get filteredUsers() {
    if (!this.partOfNickname) {
      return null;
    }

    return searchUsers(this.partOfNickname);
  }

  /**
   * 指定したユーザーにカレンダーを共有します。
   * @param userId カレンダーを共有するユーザーのID
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  private share(userId: string) {}
}
</script>
