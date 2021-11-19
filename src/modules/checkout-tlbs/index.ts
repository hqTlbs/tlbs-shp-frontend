import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { extendStore, isServer } from '@vue-storefront/core/helpers';

const examplePlugin = store => {
  // store.subscribe((mutation, state) => {
  //   console.log('Customer pressed LIKE button on the product');
  //   console.log('mutation', mutation);
  // }),
  store.subscribeAction((action, state) => {
    console.log('Customer pressed LIKE button on the product')
    console.log(action)
  })
}

const checkoutTlbsStore = {
  namespaced: true,
  state: {
  },
  plugins: ['examplePlugin']
}

export const CheckoutTlbsModule: StorefrontModule = function ({ app, store, router, moduleConfig, appConfig }) {
  console.log('CheckoutTlbsModule: Hello World and VSF!');

  store.registerModule('checkout-tlbs', checkoutTlbsStore);

  extendStore('checkout', checkoutTlbsStore);
}
