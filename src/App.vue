<template>
  <v-app>
    <v-content>
      <v-container fluid pt-0>
        <router-view />
      </v-container>
    </v-content>
    <Footer />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FooterComponent from '@/components/Footer.vue';

@Component({
  components: {
    Footer: FooterComponent,
  },
})
export default class AppComponent extends Vue {}
</script>
