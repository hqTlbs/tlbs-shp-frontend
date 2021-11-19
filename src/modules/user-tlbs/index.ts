import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { extendStore, isServer } from '@vue-storefront/core/helpers';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { userHooksExecutors } from '@vue-storefront/core/modules/user/hooks';
import * as types from '@vue-storefront/core/modules/user/store/mutation-types';
import { UserService } from '@vue-storefront/core/data-resolver'
import i18n from '@vue-storefront/i18n'

const userTlbsStore = {
  namespaced: true,
  state: {
    dummy: '' /** muss erhalten bleiben, sonst werden alle state properties des original stores entfernt */
  },
  actions: {
    /**
     * Login user and return user profile and current token
     */
    async login ({ commit, dispatch }, { username, password }) {
      await dispatch('resetUserInvalidation', {}, { root: true })

      const resp = await UserService.login(username, password)
      userHooksExecutors.afterUserAuthorize(resp)

      if (resp.code === 200) {
        try {
          commit(types.USER_TOKEN_CHANGED, { newToken: resp.result.token, meta: resp.meta }) // TODO: handle the "Refresh-token" header
          await dispatch('sessionAfterAuthorized', { refresh: true, useCache: false })
        } catch (err) {
          await dispatch('clearCurrentUser')
          throw new Error(err)
        }
      }

      return resp
    },
    /**
     * Logout user
     */
    async logout ({ commit, dispatch }, { silent = false }) {
      commit(types.USER_END_SESSION)
      await dispatch('cart/disconnect', {}, { root: true })
      await dispatch('clearCurrentUser')
      EventBus.$emit('user-after-logout')
      // clear cart without sync, because after logout we don't want to clear cart on backend
      // user should have items when he comes back
      // TLBS: do not clear cart after logout
      // await dispatch('cart/clear', { sync: false }, { root: true })

      if (!silent) {
        await dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t("You're logged out"),
          action1: { label: i18n.t('OK') }
        }, { root: true })
      }
      userHooksExecutors.afterUserUnauthorize()
    }
  }
}

export const UserTlbsModule: StorefrontModule = function ({ app, store, router, moduleConfig, appConfig }) {
  console.log('UserTlbsModule: registered!');

  store.registerModule('user-tlbs', userTlbsStore);

  extendStore('user', userTlbsStore);

  EventBus.$on('user-after-loggedin', receivedData => {
    console.log('TLBS - user-after-loggedin - NEW', receivedData)
    store.dispatch('checkout/savePersonalDetails', {
      firstName: receivedData.firstname,
      lastName: receivedData.lastname,
      emailAddress: receivedData.email,
      salutation: receivedData.salutation,
      street: receivedData.street,
      zip: receivedData.zip,
      city: receivedData.city,
      phone: receivedData.phone,
      telefax: receivedData.telefax,
      company: receivedData.company
    })
  })
}
