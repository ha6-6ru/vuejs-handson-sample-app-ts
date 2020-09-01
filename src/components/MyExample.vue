<template>
  <div>
    <v-text-field v-model="computedFooValue" v-bind="$attrs" />
    <v-btn @click="click">click!</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Mixins } from 'vue-property-decorator';
import MixinExample from '@/mixins/mixin-example';

export interface MyExampleComponentParameter {
  foo: string;
  bar: string;
}

@Component({ inheritAttrs: false })
export default class MyExample extends Mixins(MixinExample) {
  @Prop({ required: true })
  private value!: MyExampleComponentParameter;

  private get computedFooValue() {
    return this.value.foo;
  }

  private set computedFooValue(value) {
    this.$emit('input', {
      foo: value,
      bar: this.value.bar,
    });
  }

  @Emit('custom-event')
  private click() {
    return 100;
  }
}
</script>
