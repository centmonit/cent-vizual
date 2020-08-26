<template>
  <v-dialog :value="true" @input="$emit('closeDialog')" max-width="600px">
    <v-card>

      <v-card-title>
        <span class="text-subtitle-2">
          Register new License
        </span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row justify="center">

            <!-- <v-col cols="12" v-if="apiErrorMessage">

            </v-col> -->

            <v-col cols="12">
              <div v-if="apiErrorMessage">
                <v-alert dense type="error" border="left" colored-border elevation="1">
                  {{ apiErrorMessage }}
                </v-alert>
              </div>

              <v-textarea label="License content*"
                      :placeholder="licenseContentExample"
                      filled
                      v-model="modelLicense"
                      counter="1024"
                      hint="New license will replace the old one completely, without accumulation"
                      persistent-hint
                      _auto-grow
                      clearable />
            </v-col>

          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer  />
        <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        <v-btn text color="primary" @click="registerLicense" :disabled="disableSaveButton">Save</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
import {EventBus} from '@/main'

export default {
  data () {
    return {
      modelLicense: null,
      licenseContentExample: `-----CENTMONIT BEGIN LICENSE-----
line 1
line 2
line 3
-----CENTMONIT END LICENSE-----
`,
      apiErrorMessage: null
    }
  },

  computed: {
    disableSaveButton () {
      return !this.modelLicense
    }
  },

  methods: {
    registerLicense () {
      this.modelLicense = this.modelLicense.trim()
      console.log('LicenseRegister::registerLicense() - content:', this.modelLicense)

      this.apiErrorMessage = null

      axios.put(
        `${this.$GCONFIG.api_base_url}/api/license`,
        this.modelLicense
      ).then(
        response => {
          console.log('LicenseRegister::registerLicense() - api response:', response)
          if (response.data) {
            if (response.data.status === 'success') {
              EventBus.$emit('LICENSE_UPDATED', response.data.payload)
              this.$emit('closeDialog')
            } else {
              this.apiErrorMessage = 'This license was declined.'
              console.warn('LicenseRegister::registerLicense() - something is wrongs at backend')
            }
          }
        }
      ).catch(
        error => {
          console.log('LicenseRegister::registerLicense() - api error:', error)
        }
      )
    }
  }
}
</script>
