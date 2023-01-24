import React, {useState, useEffect } from 'react';
import { CardField, useStripe, useConfirmPayment } from "@stripe/stripe-react-native";
import * as SecureStore from 'expo-secure-store';
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { StyleSheet, View, Dimensions} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";







export default function CheckoutFormWrapper(props) {
  const {confirmPayment, loading} = useConfirmPayment();
  const [token, setToken] = useState([]);

  const getToken = async () => {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
    });
  }

  useEffect(() => {
    const token = SecureStore.getItemAsync('secure_token').then(t =>{
      if (t) {
        setToken(t);
      }
    });
  }, []);

  const fetchPaymentIntentClientSecret = async () => {
    const response = await fetch('http://test.onispot.com/api/user/new-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        currency: 'usd',
        amount:'1'
      }),
    });
    const {clientSecret} = await response.json();

    return clientSecret;
  };

  const handlePayPress = async () => {
    // Gather the customer's billing information (for example, email)
    const billingDetails = {
      email: 'jenny.rosen@example.com',
    };

    // Fetch the intent client secret from the backend
    const clientSecret = await fetchPaymentIntentClientSecret();

    // Confirm the payment with the card details
    const {paymentIntent, error} = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });

    if (error) {
      console.log('Payment confirmation error', error);
    } else if (paymentIntent) {
      console.log('Success from promise', paymentIntent);
    }
  };

  const getCampaign = async(campaign) => {
    try {
        apiClient.get('campaign/'+campaign, 
        { },
        { headers: {Authorization: 'Bearer ' + this.state.token}})
        .then(r => {
            this.setState({objcampaign:r.data, budget:r.data.budget});
            this.getAudience(campaign)
        }).catch(e => { 
            console.log(e);
        }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
}


    return (
      <Block flex style={styles.container}>
        <Block space="between" style={styles.padded}>
        <Text center h5>Proceed to payment</Text>
          <View  center style={{marginTop:30}}>
            <CardField
              postalCodeEnabled={false}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                console.log("cardDetails", cardDetails);
              }}
            />
            </View>
            <Block  center>
               
                    <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                    <Button
                        style={styles.button}
                        color='transparent'
                        padding='0 0 0 0'
                        onPress={handlePayPress}
                        disabled={loading} 
                        textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                    >
                        PAY
                    </Button>
                    </LinearGradient>
            </Block>
          </Block>
      </Block>
    );
} 

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  padded: {
    paddingTop:30,
    paddingHorizontal: theme.SIZES.BASE,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
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
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 30,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  input: {
    height: 44,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
  },
});