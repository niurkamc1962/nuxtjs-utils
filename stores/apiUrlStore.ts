import { defineStore } from 'pinia';

interface ApiUrlState {
  frappeApiUrl: string;
  fastApiUrl: string;
  appName: string;
}

export const useApiUrlStore = defineStore('apiUrl', {
  state: (): ApiUrlState => ({
    frappeApiUrl: process.env.NUXT_PUBLIC_FRAPPE_API_URL || '',
    fastApiUrl: process.env.NUXT_PUBLIC_FASTAPI_URL || '',
    appName: '',
  }),
  actions: {
    setFrappeApiUrl(newUrl: string) {
      this.frappeApiUrl = newUrl;
    },
    setFastApiUrl(newUrl: string) {
      this.fastApiUrl = newUrl;
    },
    setAppName(newAppName: string) {
      this.appName = newAppName;
    }
  },
  persist: true,
});