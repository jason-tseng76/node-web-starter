<style lang="stylus" scoped>
</style>
<template lang="pug">
.min-vh-100.d-flex
  button.toplink-item.btn.btn-info.btn-sm(@click="axiosCall") Axios Call
  //- button.toplink-item.btn.btn-info.btn-sm(@click="apolloCall") Apollo Call
  button.toplink-item.btn.btn-info.btn-sm(@click="axiosMutation") Axios Mutation
  button.toplink-item.btn.btn-info.btn-sm(@click="gql") this.$gqlCall
</template>
<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';

import axios from 'axios';
// import gql from 'graphql-tag';
// import { print } from 'graphql';

export default {
  components: {},
  data: () => ({
  }),
  computed: {
    ...mapState([]),
    ...mapGetters([]),
  },
  watch: {},
  created() {},
  mounted() {
    // setTimeout(() => {
    //   this.$GQL.cancelCall('123');
    // }, 10);
    // this.setAccessToken('aaaaaaa');
    console.log('mounted');
  },
  beforeDestroy() {},
  methods: {
    ...mapMutations([]),
    ...mapActions(['setAccessToken']),
    // ...mapActions('SKGQL', ['gqlCall', 'gqlCancel']),
    async gql() {
      const query = `query test($limit:Int, $offset:Int) {
        accounts {
          account_id
          sky_id
          account_name
          email
          apps {
            name
          }
        }
        accountsPagenate(limit:$limit, offset:$offset) {
          totalCount
          data {
            sky_id
            account_name
            apps {
              name
              client_id
            }
          }
        }
      }`;
      const variables = {
        limit: 5, offset: 5,
      };
      const cancelID = '123';
      try {
        const rs = await this.$SKGQL.call({ query, variables, cancelID });
        console.log(rs);
        // if (rs.errors) {
        //   console.log(rs);
        // } else {
        //   throw rs;
        // }
      } catch (e) {
        console.log('catch');
        console.log(e);
      }
    },
    async axiosCall() {
      const rs = await this.$SKAPI.call({
        url: '/api/v1.0/account',
        responseType: 'text',
        headers: {
          origin: 'http://localhost:8080',
        },
      });

      console.log(rs);
    },

    async axiosMutation() {
      let qstr = `mutation test($name:String!, $email:String!) {
        addAccount(name:$name, email:$email) {
          name
        }
      }`;
      // qstr = qstr.replace(/  +|\t| (?=\n)/g, '');
      qstr = qstr.replace(/  +/g, ' ');
      const variables = {
        name: 'jason',
        email: 'jason@medialand.tw',
      };
      const rs = await axios({
        url: '/v1.0/gql',
        method: 'post',
        data: {
          query: qstr,
          variables,
        },
        // cancelToken: source.token,
      });
      console.log(rs.data);
    },
  },
};
</script>
