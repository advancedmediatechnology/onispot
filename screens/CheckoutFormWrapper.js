import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { StyleSheet, Text, View } from 'react-native';







export default function CheckoutFormWrapper(props) {
    return (
      <View>
        <Text>Card</Text>
        <CardField
          postalCodeEnabled={false}
          style={styles.cardField}
          onCardChange={(cardDetails) => {
            console.log("cardDetails", cardDetails);
          }}
        />
      </View>
    );
} 

const styles = StyleSheet.create({
  cardField: {
    width: "100%",
    height: 50,
    marginVertical: 30,
  },
  emailField: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 6,
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  input: {
    height: 44,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
  },
});