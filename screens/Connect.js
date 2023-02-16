import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  View
} from "react-native";
import equal from 'fast-deep-equal'
import { Block, Text, theme, Button } from "galio-framework";
import { WebView } from 'react-native-webview';
import {BACKEND_PATH} from "@env"

import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const apiClient = axios.create({
  baseURL: BACKEND_PATH ,
  withCredentials: true,
});

class Connect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token:null,
      social:null,
      socialurl:null,
    };
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
        this.getUser()
    });
  }

  async getUser() {
    apiClient.post('user', 
    { },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      this.setState({ 
        prefcategories: r.data.categories, 
        prefstyles: r.data.styles, 
        name: r.data.name, 
        birthdate: r.data.birthdate, 
        gender:r.data.gender 
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }


  componentDidUpdate(prevProps, prevState) {
    try {
        const { social } = this.props.route.params
        //Ensuring This is not the first call to the server
        if(social && social !== this.state.social) {
          this.setState({social:social});
        //this.getSociaUrl(social); // Get the new Project when project id Change on Url
        }
    } catch(error) {
        console.log(error);
    };
  }

  /*componentDidUpdate(prevProps) {
    if(!equal(this.props.route, prevProps.route)) 
    {
      const { social } = this.props.route.params
      this.setState({social:social});
    }
  } */

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getToken();
  }

  render() {
    const {social} = this.state;
    const {token} = this.state;
    const { navigation } = this.props;
    console.log('https://test.onispot.com/authenticated-iframe/'+token+'/'+social);
    return (
        <View style={{ flex: 1 }}>
            {social && token &&
                <WebView
                    source={{
                        uri: 'https://test.onispot.com/authenticated-iframe/'+token+'/'+social,/*uri: 'http://test.onispot.com/api/socials/'+social+'/connect/?token='+token,*/  headers: {Authorization: "Bearer "+this.state.token}
                    }}
                />
            }
      </View>  
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
    backgroundColor: argonTheme.COLORS.WHITE
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0
  },
  nameInfo: {
    marginTop: 35
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF"
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default Connect;
