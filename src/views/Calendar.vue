<template>
  <v-row class="fill-height">
    <v-col class="pt-0">
      <v-sheet height="64">
        <v-toolbar flat>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>chevron_left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>chevron_right</v-icon>
          </v-btn>
          <v-toolbar-title v-text="title" />
        </v-toolbar>
      </v-sheet>
      <v-sheet height="580">
        <v-calendar
          v-if="visible"
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="filteredEvents"
          :event-color="getEventColor"
          :now="today"
          :type="type"
          :day-format="formatDay"
          :month-format="formatMonth"
          event-more-text="他 {0} 件"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="startAddEvent"
          @change="updateRange"
        />
      </v-sheet>
      <v-sheet>
        <v-row align="center" justify="center">
          <v-switch
            v-for="(sharedUser, index) in sharedUsers"
            :key="index"
            v-model="sharedUser.display"
            class="ml-4 pt-0"
            :color="sharedUser.themeColor"
            :label="sharedUser.nickname"
            hide-details
          />
        </v-row>
      </v-sheet>
      <v-menu
        v-model="isOpenEventMenu"
        :close-on-content-click="false"
        :activator="menuActivatorElement"
        bottom
        max-width="350"
        min-width="350"
      >
        <v-card v-if="selectedEvent" color="grey lighten-4" flat>
          <v-toolbar :color="getEventColor(selectedEvent)" dark>
            <v-toolbar-title v-text="selectedEvent.name" />
            <v-spacer />
            <v-btn
              icon
              :disabled="isNotOwner(selectedEvent.userId)"
              @click.stop="startEditEvent"
            >
              <v-icon>edit</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <p class="mb-0" v-text="`開始: ${selectedEvent.start}`" />
            <p v-text="formatEndDateTime" />
            <p :class="$style.memo" v-text="selectedEvent.memo" />
          </v-card-text>
        </v-card>
      </v-menu>
      <v-dialog
        v-model="isOpenEventDialog"
        persistent
        max-width="600"
        open-on-hover
      >
        <v-card v-if="newEvent">
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="newEvent.name" label="タイトル*" />
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-dialog
                        ref="startDatePickerDialog"
                        v-model="isOpenStartDatePicker"
                        :return-value.sync="startDate"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="startDate"
                            label="開始日*"
                            prepend-icon="event"
                            readonly
                            v-on="on"
                          />
                        </template>
                        <v-date-picker
                          v-model="startDate"
                          scrollable
                          :day-format="formatDayForDatePicker"
                        >
                          <v-spacer />
                          <v-btn
                            text
                            color="primary"
                            @click="closeStartDatePicker"
                            >キャンセル
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.startDatePickerDialog.save(startDate)"
                            >OK
                          </v-btn>
                        </v-date-picker>
                      </v-dialog>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-dialog
                        ref="startTimePickerDialog"
                        v-model="isOpenStartTimePicker"
                        :return-value.sync="startTime"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="startTime"
                            label="開始時刻"
                            prepend-icon="access_time"
                            readonly
                            clearable
                            @click:clear="clearStartTime"
                            v-on="on"
                          />
                        </template>
                        <v-time-picker
                          v-if="isOpenStartTimePicker"
                          v-model="startTime"
                          full-width
                        >
                          <v-spacer />
                          <v-btn
                            text
                            color="primary"
                            @click="closeStartTimePicker"
                            >キャンセル
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.startTimePickerDialog.save(startTime)"
                            >OK
                          </v-btn>
                        </v-time-picker>
                      </v-dialog>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-dialog
                        ref="endDatePickerDialog"
                        v-model="isOpenEndDatePicker"
                        :return-value.sync="endDate"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="endDate"
                            label="終了日"
                            prepend-icon="event"
                            readonly
                            clearable
                            @click:clear="clearEndDate"
                            v-on="on"
                          />
                        </template>
                        <v-date-picker
                          v-model="endDate"
                          scrollable
                          :day-format="formatDayForDatePicker"
                        >
                          <v-spacer />
                          <v-btn
                            text
                            color="primary"
                            @click="closeEndDatePicker"
                            >キャンセル
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.endDatePickerDialog.save(endDate)"
                            >OK
                          </v-btn>
                        </v-date-picker>
                      </v-dialog>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-dialog
                        ref="endTimePickerDialog"
                        v-model="isOpenEndTimePicker"
                        :return-value.sync="endTime"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="endTime"
                            label="終了時刻"
                            prepend-icon="access_time"
                            readonly
                            :disabled="disabledEndTime"
                            clearable
                            @click:clear="clearEndTime"
                            v-on="on"
                          />
                        </template>
                        <v-time-picker
                          v-if="isOpenEndTimePicker"
                          v-model="endTime"
                          full-width
                        >
                          <v-spacer />
                          <v-btn
                            text
                            color="primary"
                            @click="closeEndTimePicker"
                            >キャンセル
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.endTimePickerDialog.save(endTime)"
                            >OK
                          </v-btn>
                        </v-time-picker>
                      </v-dialog>
                    </v-col>
                  </v-row>
                  <v-textarea
                    v-model="newEvent.memo"
                    rows="1"
                    auto-grow
                    label="メモ"
                  />
                  <v-switch
                    v-model="newEvent.shared"
                    label="共有"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-container>
            <small>*必須フィールドを示します</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" text @click="closeEventDialog">
              キャンセル
            </v-btn>
            <v-btn color="blue darken-1" text @click="save">保存する</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { CalendarTimestamp, CalendarEvent } from 'vuetify';
import {
  parseDate,
  parseTimestamp,
} from 'vuetify/lib/components/VCalendar/util/timestamp';
import { NewCalendarEvent } from '@/store/calendar-event.model';
import { calendarEventStore, add, update } from '@/store/calendar-event';
import { sharedUserStore, getThemeColor } from '@/store/shared-user';
import { profileStore } from '@/store/profile/profile';

type Refs<T extends object> = Vue['$refs'] & T;

@Component
export default class CalendarComponent extends Vue {
  $refs!: Refs<{
    calendar: {
      scrollToTime(time: string): void;
      prev(): void;
      next(): void;
    };
  }>;

  /**
   * 表示するカレンダーの種類（月/週/日）を指定します。
   */
  @Prop({
    required: true,
    validator: (value: string) => {
      return ['month', 'week', 'day'].includes(value);
    },
  })
  private type!: string;

  /**
   * カレンダーの表示範囲（開始日付）です。
   */
  private start: CalendarTimestamp | null = null;

  /**
   * カレンダーの表示範囲（終了日付）です。
   */
  private end: CalendarTimestamp | null = null;

  /**
   * カレンダーを描画するかどうかを示す値です。
   */
  private visible = true;

  /**
   * カレンダー上でフォーカスする日付です。
   */
  private focus = '';

  /**
   * 本日の日付です。
   */
  private today = parseDate(new Date()).date;

  /**
   * カレンダーを共有しているユーザーです。
   */
  private sharedUsers = sharedUserStore.sharedUsers;

  /**
   * イベントメニューを表示するかどうかを示す値です。
   */
  private isOpenEventMenu = false;

  /**
   * イベントメニューをアクティブにする要素です。
   * 詳細は`v-menu`コンポーネントのドキュメントを参照してください。
   */
  private menuActivatorElement: HTMLElement | null = null;

  /**
   * 選択したイベントです。
   */
  private selectedEvent: CalendarEvent | null = null;

  /**
   * イベント登録/編集ダイアログを表示するかどうかを示す値です。
   */
  private isOpenEventDialog = false;

  /**
   * 登録/更新対象の新しいイベントの情報です。
   */
  private newEvent: NewCalendarEvent | null = null;

  /**
   * イベント開始日付を選択する`v-date-picker`を表示するかどうかを示す値です。
   */
  private isOpenStartDatePicker = false;

  /**
   * `v-date-picker`コンポーネントで選択したイベント開始日付です。
   */
  private startDate: string | null = null;

  /**
   * イベント開始時刻を選択する`v-time-picker`コンポーネントを表示するかどうかを示す値です。
   */
  private isOpenStartTimePicker = false;

  /**
   * `v-time-picker`コンポーネントで選択したイベント開始時刻です。
   */
  private startTime: string | null = null;

  /**
   * イベント終了日付を選択する`v-date-picker`コンポーネントを表示するかどうかを示す値です。
   */
  private isOpenEndDatePicker = false;

  /**
   * `v-date-picker`コンポーネントで選択したイベント終了日付です。
   */
  private endDate: string | null = null;

  /**
   * イベント終了時刻を選択する`v-time-picker`コンポーネントを表示するかどうかを示す値です。
   */
  private isOpenEndTimePicker = false;

  /**
   * `v-time-picker`コンポーネントで選択したイベント終了時刻です。
   */
  private endTime: string | null = null;

  /**
   * カレンダー上部に表示する日付を取得します。
   */
  private get title() {
    if (!this.start || !this.end) {
      return '';
    }

    if (this.type === 'week') {
      return this.start.month === this.end.month
        ? `${this.start.year}年 ${this.start.month}月`
        : `${this.start.year}年 ${this.start.month}月～${this.end.month}月`;
    }

    return `${this.start.year}年 ${this.start.month}月`;
  }

  /**
   * カレンダーに表示するイベントです。
   * スイッチによってフィルタリングを行います。
   */
  private get filteredEvents() {
    const displayUserIds = this.sharedUsers
      .filter(user => user.display)
      .map(user => user.userId);

    return calendarEventStore.calendarEvents.filter(event =>
      displayUserIds.includes(event.userId),
    );
  }

  /**
   * 終了時刻を表示用にフォーマットします。
   */
  private get formatEndDateTime() {
    return !this.selectedEvent || !this.selectedEvent.end
      ? ''
      : `終了: ${this.selectedEvent.end}`;
  }

  /**
   * イベント終了時刻の入力を無効にするかどうかを判定します。
   */
  private get disabledEndTime() {
    return !this.endDate || !this.startTime;
  }

  /**
   * `updated`ライフサイクルフックです。
   */
  private updated() {
    if (this.type === 'month') {
      return;
    }

    this.$nextTick(() => {
      this.$refs.calendar.scrollToTime('07:00');
    });
  }

  /**
   * カレンダーを本日の日付に移動します。
   */
  private setToday() {
    this.focus = this.today;
  }

  /**
   * カレンダーを1つ前に戻します。
   */
  private prev() {
    this.$refs.calendar.prev();
  }

  /**
   * カレンダーを1つ先に進めます。
   */
  private next() {
    this.$refs.calendar.next();
  }

  /**
   * イベントの色を取得します。
   */
  private getEventColor(event: CalendarEvent) {
    if (!event) {
      return;
    }

    return getThemeColor(event.userId);
  }

  /**
   * カレンダーに表示する日のフォーマットを行います。
   */
  private formatDay(timestamp: CalendarTimestamp) {
    return new Date(timestamp.date).getDate();
  }

  /**
   * カレンダーに表示する月のフォーマットを行います。
   */
  private formatMonth(timestamp: CalendarTimestamp) {
    return `${new Date(timestamp.date).getMonth() + 1} /`;
  }

  /**
   * イベント詳細を表示します。
   */
  private showEvent({
    nativeEvent,
    event,
  }: {
    nativeEvent: Event;
    event: CalendarEvent;
  }) {
    // 実装は https://vuetifyjs.com/ja/components/calendars/#イベント 参照。
    // setTimeoutを使用して遅延させないと、メニューを正しく表示できない。
    const open = () => {
      this.selectedEvent = event;
      this.menuActivatorElement = nativeEvent.target as HTMLInputElement;
      setTimeout(() => {
        this.isOpenEventMenu = true;
      }, 10);
    };

    if (this.isOpenEventMenu) {
      this.isOpenEventMenu = false;
      setTimeout(open, 10);
    } else {
      open();
    }

    // クリックイベントの伝搬を抑止します。
    nativeEvent.stopPropagation();
  }

  /**
   * カレンダー（日）を表示します。
   */
  private viewDay({ date }: { date: string }) {
    this.focus = date;
    this.$router.push('/calendar/day');
  }

  /**
   * イベントの新規登録を開始します。
   */
  private startAddEvent({ date }: { date: string }) {
    this.newEvent = {
      id: null,
      userId: null,
      name: null,
      start: date,
      end: null,
      memo: null,
      shared: true,
    };

    this.startDate = parseTimestamp(this.newEvent.start).date;
    this.isOpenEventDialog = true;

    // クリックイベントの伝搬を抑止します。
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event!.stopPropagation();
  }

  /**
   * カレンダー上部の年月を表示するために使用する、表示範囲を更新します。
   * カレンダーが描画されたタイミング、または表示範囲が変更されたタイミングで呼び出されます。
   */
  private updateRange({
    start,
    end,
  }: {
    start: CalendarTimestamp;
    end: CalendarTimestamp;
  }) {
    this.start = start;
    this.end = end;
  }

  /**
   * 自分のイベントではないことを判定します。
   */
  private isNotOwner(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return userId !== profileStore.profile!.userId;
  }

  /**
   * イベントの編集を開始します。
   */
  private startEditEvent() {
    if (!this.selectedEvent) {
      return;
    }

    const startTimestamp = parseTimestamp(this.selectedEvent.start);
    this.startDate = startTimestamp.date;
    this.startTime = startTimestamp.time;

    if (this.selectedEvent.end) {
      const endTimestamp = parseTimestamp(this.selectedEvent.end);
      this.endDate = endTimestamp.date;
      this.endTime = endTimestamp.time;
    }

    this.newEvent = { ...this.selectedEvent } as NewCalendarEvent;
    this.isOpenEventMenu = false;
    this.isOpenEventDialog = true;
  }

  /**
   * イベント日付選択ダイアログに表示する日のフォーマットを行います。
   */
  private formatDayForDatePicker(date: string) {
    return new Date(date).getDate();
  }

  /**
   * イベント開始日付選択ダイアログを閉じます。
   */
  private closeStartDatePicker() {
    this.isOpenStartDatePicker = false;
  }

  /**
   * 日付/時刻選択ダイアログにバインドしている値を初期化します。
   */
  private clearPickerBindValue() {
    this.startDate = null;
    this.startTime = null;
    this.endDate = null;
    this.endTime = null;
  }

  /**
   * カレンダーを再描画します。
   */
  private refresh() {
    this.visible = false;
    this.$nextTick(() => {
      this.visible = true;
    });
  }

  /**
   * イベントの変更内容を保存します。
   */
  private save() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newEvent = this.newEvent!;

    newEvent.start = !this.startTime
      ? `${this.startDate}`
      : `${this.startDate} ${this.startTime}`;

    // 終了日は必須でない
    if (this.endDate) {
      newEvent.end = !this.endTime
        ? `${this.endDate}`
        : `${this.endDate} ${this.endTime}`;
    }

    if (!newEvent.id) {
      add(newEvent);
    } else {
      update(newEvent);
    }

    this.clearPickerBindValue();
    this.isOpenEventDialog = false;
    this.refresh();
  }

  /**
   * イベント開始時刻の値をクリアします。
   */
  private clearStartTime() {
    this.startTime = null;
    // イベント終了時刻のみの入力はできないため、イベント終了時刻もクリアする。
    this.endTime = null;
  }

  /**
   * イベント開始時刻選択ダイアログを閉じます。
   */
  private closeStartTimePicker() {
    this.isOpenStartTimePicker = false;
  }

  /**
   * イベント終了日付の値をクリアします。
   */
  private clearEndDate() {
    this.endTime = null;
    // イベント終了時刻もクリアする。
    this.endTime = null;
  }

  /**
   * イベント終了日付選択ダイアログを閉じます。
   */
  private closeEndDatePicker() {
    this.isOpenEndDatePicker = false;
  }

  /**
   * イベント終了時刻の値をクリアします。
   */
  private clearEndTime() {
    this.endTime = null;
  }

  /**
   * イベント終了時刻選択ダイアログを閉じます。
   */
  private closeEndTimePicker() {
    this.isOpenEndTimePicker = false;
  }

  /**
   * イベント登録/編集ダイアログを閉じます。
   */
  private closeEventDialog() {
    this.clearPickerBindValue();
    this.isOpenEventDialog = false;
  }
}
</script>

<style lang="scss" module>
.memo {
  white-space: pre-wrap;
}
</style>
