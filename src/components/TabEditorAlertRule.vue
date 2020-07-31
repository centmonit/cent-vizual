<template>
  <v-dialog :value="true" max-width="600px">
    <v-card>

      <v-card-title>
        <span class="text-subtitle-2">
          New Rule
        </span>
      </v-card-title>

      <v-card-text>
        <v-form v-model="formValid">
          <v-container>
            <v-row justify="center">

              <v-col cols="12">

              </v-col>

            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer  />
        <v-btn text @click="$emit('closeDialog')">Close</v-btn>
        <v-btn text color="primary" @click="saveChannel">Save</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    formValid: false
  })
}
</script>