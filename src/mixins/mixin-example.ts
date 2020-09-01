import { Vue, Component } from 'vue-property-decorator';

@Component
export default class MixinExample extends Vue {
  private created() {
    console.log(this.$options.name, 'created');
  }

  private mounted() {
    console.log(this.$options.name, 'mounted');
  }
}
