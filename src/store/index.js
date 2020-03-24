/* eslint no-shadow:0 */
// import Vue from 'vue';

export const state = () => ({
  sky_id: '',
  access_token: '',
});

export const getters = {
  // getToken: (state) => state.token,
};

export const mutations = {
  setAccessToken: (state, token) => {
    state.access_token = token;
  },
};

export const actions = {
  onAccessTokenError: (_, code) => {
    console.log(`onAccessTokenError: ${code}`);
  },
  onAccessTokenChange: (_, newToken) => {
    console.log(`onAccessTokenChange: ${newToken}`);
  },
  // setAccessToken: ({ dispatch }, token) => {
  //   state.access_token = token;
  //   Vue.SKGQL.setAccessToken(token);

  //   Vue.SKGQL.onAccessTokenChange = (t) => {
  //     console.log(`onAccessTokenChange: ${t}`);
  //     dispatch('setAccessToken', t);
  //   };
  // },
};
