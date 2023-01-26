import React, {useState, useEffect } from 'react';
import axios from 'axios';
import {
  CardField,
  useStripe,
  useConfirmPayment,
  initStripe,
} from "@stripe/stripe-react-native";
import * as SecureStore from 'expo-secure-store';
import { Block, Checkbox, theme, Text,  Button } from "galio-framework";
import {
  Dimensions,
  StyleSheet,
  
  View,
  Pressable,
  Platform,
} from "react-native";

import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";

const numberFormat = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
}).format(value);

const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

const ProductsScreen = ({ campaign_id, navigateToCheckout }) => {
  const [campaignrobuy, setCampaignrobuy] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      await SecureStore.getItemAsync('secure_token').then(t =>{
        try {
          apiClient.get('campaign/'+campaign_id, 
          { },
          { headers: {Authorization: 'Bearer ' + t}})
          .then(r => {
            setCampaignrobuy(r.data);
          }).catch(e => { 
              console.log(e);
          }).finally(()=>{});
        } catch(error) {
            console.log(error);
        };
      });
    })();
  }, [campaign_id]);

  

  const handleContinuePress = async () => {
    /* Send the cart to the server */
    const URL = "http://test.onispot.com/api/new-payment-intent/?amount="+campaignrobuy.budget+"&campaign_id="+campaignrobuy._id;
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application-json",
      },
    });

    /* Await the response */
    const { publishableKey, clientSecret, merchantName } =
      await response.json();

    /* Navigate to the CheckoutScreen */
    /* You can use navigation.navigate from react-navigation */
    navigateToCheckout({
      publishableKey,
      clientSecret,
      merchantName,
      campaignrobuy,
    });
  };

  

  return (
    <Block center>
      {campaignrobuy && (
        <Block>
          <Text style={{fontSize:15, marginTop:20}}>Campaign name: {campaignrobuy.name}</Text>
          <Text style={{fontSize:15, marginTop:10}}>Campaign budget: {numberFormat(campaignrobuy.budget)}</Text>
        </Block>
      )}
      <Block style={{ marginTop: 40 }}>
      <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
          <Button style={styles.button}
            color='transparent'
            textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
            padding='0 0 0 0' 
            onPress={handleContinuePress} >
              CONTINUE
          </Button>
        </LinearGradient>
      </Block>
    </Block>
  );
};

/**
 * CheckoutScreen related components
 */

const MethodSelector = ({ onPress, paymentMethod }) => {
  // ...
  return (
    <View style={{ marginTop:10 }}>
      <Text center style={{ fontSize:14, fontWeight: '500', marginBottom:20  }}>
        Select payment method
      </Text>
      {/* If there's no paymentMethod selected, show the options */}


      
      {!paymentMethod && (
        <Pressable
          onPress={onPress}
          style={{
            flexDirection: "row",
            paddingVertical: 8,
            alignItems: "center",
          }}
        >

          <View style={[styles.selectButton, { marginLeft: 16 }]}>
            <Text style={[styles.boldText, { color: "#007DFF" }]}>Card</Text>
          </View>
        </Pressable>
      )}




      {/* If there's a paymentMethod selected, show it */}
      {!!paymentMethod && (
        <Pressable
          onPress={onPress}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          
          {!paymentMethod.label.toLowerCase().includes("google") &&
            !paymentMethod.label.toLowerCase().includes("apple") && (
              <View style={[styles.selectButton, { marginRight: 16 }]}>
                <Text style={[styles.boldText, { color: "#007DFF" }]}>
                  {paymentMethod.label}
                </Text>
              </View>
            )}
          <Text style={[styles.boldText, { color: "#007DFF", flex: 1 }]}>
            Change payment method
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const CheckoutScreen = ({
  navigateBack,
  publishableKey,
  clientSecret,
  campaignrobuy,
  merchantName,
}) => {
  // We will store the selected paymentMethod
  const [paymentMethod, setPaymentMethod] = React.useState();

  // Import some stripe functions
  const { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } =
    useStripe();

  // Initialize stripe values upon mounting the screen
  React.useEffect(() => {
    (async () => {
      await initStripe({
        publishableKey,
        // Only if implementing applePay
        // Set the merchantIdentifier to the same
        // value in the StripeProvider and
        // striple plugin in app.json
        merchantIdentifier: "yourMerchantIdentifier",
      });

      // Initialize the PaymentSheet with the paymentIntent data,
      // we will later present and confirm this
      await initializePaymentSheet();
    })();
  }, []);

  const initializePaymentSheet = async () => {
    const { error, paymentOption } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      customFlow: true,
      merchantDisplayName: merchantName,
      style: "alwaysDark", // If darkMode
      googlePay: true, // If implementing googlePay
      applePay: true, // If implementing applePay
      merchantCountryCode: "ES", // Countrycode of the merchant
      testEnv: __DEV__, // Set this flag if it's a test environment
    });
    if (error) {
      console.log(error);
    } else {
      // Upon initializing if there's a paymentOption
      // of choice it will be filled by default
      setPaymentMethod(paymentOption);
    }
  };

  const handleSelectMethod = async () => {
    const { error, paymentOption } = await presentPaymentSheet({
      confirmPayment: false,
    });
    if (error) {
      alert(`Error code: ${error.code}`, error.message);
    }
    setPaymentMethod(paymentOption);
  };

  const handleBuyPress = async () => {
    if (paymentMethod) {
      const response = await confirmPaymentSheetPayment();

      if (response.error) {
        alert(`Error ${response.error.code}`);
        console.error(response.error.message);
      } else {
        alert("Purchase completed!");
      }
    }
  };

  return (
    <View>
      {campaignrobuy && (
        <Block center>
          <Block style={{fontSize:15, marginBottom:20}}>
            <Text style={{fontSize:15, marginTop:20}}>Campaign name: {campaignrobuy.name}</Text>
            <Text style={{fontSize:15, marginTop:10}}>Campaign budget: {numberFormat(campaignrobuy.budget)}</Text>
          </Block>
        </Block>
      )}
      <MethodSelector
        onPress={handleSelectMethod}
        paymentMethod={paymentMethod}
      />
      <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30, marginTop:20}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
      <Button
        style={styles.button}
        color='transparent'
        textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
        padding='0 0 0 0' onPress={() =>handleBuyPress()}>
          PAY
       </Button>
      </LinearGradient>
    </View>
  );
};

const AppContent = (props) => {
  const [screenProps, setScreenProps] = React.useState(null);

  const navigateToCheckout = (screenProps) => {
    setScreenProps(screenProps);
  };

  const navigateBack = () => {
    setScreenProps(null);
  };

  return (
    <Block>
        {!screenProps  && (
          <ProductsScreen
            campaign_id={props.campaign_id}
            navigateToCheckout={navigateToCheckout}
          />
        )}
      {!!screenProps && (
        <CheckoutScreen {...screenProps} navigateBack={navigateBack} />
      )}
     
    </Block>
  );
};





export default function CheckoutFormWrapper(props) {
    
    return (
      <Block  style={styles.container}>
        <Block space="between" style={styles.padded}>
          <Text center h5 style={{marginTop:20}}>
            Proceed to payment
          </Text>
          <AppContent campaign_id={props.route.params.campaign}/>
        </Block>
      </Block>
    );
} 

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    alignSelf: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productRow: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    width: "75%",
  },
  buyButton: {
    backgroundColor: "#007DFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  textButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    color: "#007DFF",
  },
  selectButton: {
    borderColor: "#007DFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  boldText: {
    fontSize: 17,
    fontWeight: "700",
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
});
