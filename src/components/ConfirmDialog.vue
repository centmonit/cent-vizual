<template>
  <v-row justify="center">
    <v-dialog :value="true" @input="$emit('closeDialog')" max-width="290">
      <v-card>
        <v-card-title class="text-subtitle-1">Delete this item?</v-card-title>
        <!-- <v-card-text></v-card-text> -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn  text @click="$emit('closeDialog')">Close</v-btn>
          <v-btn color="primary" text @click="$emit('agreeConfirm')">Agree</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
}
</script>