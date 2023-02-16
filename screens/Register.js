import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import {BACKEND_PATH} from "@env"
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";

const apiClient = axios.create({
  baseURL: BACKEND_PATH ,
  withCredentials: true,
});

class Register extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      erroremail:false,
      password: '',
      errorpass:false,
      name:'',
      errorname:false,
      repassword: '',
      errorrepass:false,
      termsAccepted: false,
      isLoading: false,
      isLogged: false
    };
  }

  handleCheckBox() {
    this.setState({ termsAccepted: !this.state.termsAccepted })
  }

  getPlaceHolder(witch, statusfielderror, message) {
    if (!statusfielderror) {
      return witch;
    } else {
      return witch + " " + message;
    }
  }

  async signin(name, email, password, password_confirmation) {
    const { navigation } = this.props;
    var status = true;
    if (name === '') {
      this.setState({errorname: true});
      status = false;
    } else {
      this.setState({errorname: false});
    }
    if (email === '') {
      this.setState({erroremail: true});
      status = false;
    } else {
      this.setState({erroremail: false});
    }
    if (password === '') {
      this.setState({errorpass: true});
      status = false;
    } else {
      this.setState({errorpass: false});
    }
    if (password != password_confirmation) {
      this.setState({errorrepass: true});
      alert('password doesen\'t match');
      status = false;
    } else {
      this.setState({errorrepass: false});
    }
    if (!status) {
      return
    }
    if (!this.state.termsAccepted) {
      alert("You must agree with the privacy policy");
      return;
    }
    
    this.setState({isLoading: true});
    apiClient.get('csrf-cookie')
      .then(r => { 
        apiClient.post('register', { 
          name, email, password, password_confirmation
        })
        .then(r => {
          console.log(r);
          this.setState({token: r.data.token});
          SecureStore.setItemAsync('secure_token',r.data.token);
          this.setState({isLoading: false});
          navigation.navigate("App");
        })
        .catch(e => { 
          console.log(e);
          this.setState({isLoading: false});
        })
        .finally(()=>{
          this.setState({isLoading: false});
        })
      })
  }

  render() {
    const { isLoading, isLogged } = this.state;
    return (
      <Block flex style={styles.container}>
        <Block flex center>
        </Block>
        <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                enabled
              >
          <Block flex center space="between" style={styles.padded}>
            <Image source={Images.LogoOnboarding} style={styles.logo} />
            <Block flex space="around" style={{ zIndex: 2 }}>
                <Block flex style={styles.title}>
                    <Block  style={{marginBottom: 10}}>
                      <Input
                        onChange={(e) => this.setState({ name: e.nativeEvent.text })}
                        error={this.state.errorname}
                        borderless={!this.state.errorname}
                        placeholder={this.getPlaceHolder('Name',this.state.errorname, 'required')}
                      />
                    </Block>
                    <Block  style={{marginBottom: 10}}>
                    <Input
                        onChange={(e) => this.setState({ email: e.nativeEvent.text })}
                        error={this.state.erroremail}
                        borderless={!this.state.erroremail}
                        placeholder={this.getPlaceHolder('Email',this.state.erroremail, 'required')}
                    />
                    </Block>
                    <Block style={{marginBottom: 11}}>
                      <Input
                        onChange={(e) => this.setState({ password: e.nativeEvent.text })}
                        password
                        error={this.state.errorpass}
                        borderless={!this.state.errorpass}
                        placeholder={this.getPlaceHolder('Password', this.state.errorpass, 'required')}
                        
                      />
                    </Block>
                    <Block style={{marginBottom: 20}}>
                      <Input
                        onChange={(e) => this.setState({ repassword: e.nativeEvent.text })}
                        password
                        error={this.state.errorrepass}
                        borderless={!this.state.errorrepass}
                        placeholder={this.getPlaceHolder('Password', this.state.errorrepass, 'doesn\'t match')}
                        
                      />
                    </Block>
                    <Block row width={width * 0.75} style={{marginBottom: 20}}>
                      <Checkbox
                        checkboxStyle={{
                          borderWidth: 3
                        }}
                        onChange={() => this.handleCheckBox()}
                        color={argonTheme.COLORS.PRIMARY}
                        label="I agree with the"
                      />
                      <Button
                        style={{ width: 150 }}
                        color="transparent"
                        textStyle={{
                          color: argonTheme.COLORS.PRIMARY,
                          fontSize: 14
                        }}
                      >
                        Privacy Policy
                      </Button>
                    </Block>
                    <Block center>
                    {isLoading  ? <ActivityIndicator/> : (
                      <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                        style={{borderRadius: 30}} 
                        start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                        <Button
                          style={styles.button}
                          color='transparent'
                          padding='0 0 0 0'
                          onPress={() => this.signin(this.state.name, this.state.email, this.state.password, this.state.repassword)}
                          textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                        >
                          SIGN IN 
                        </Button>
                      </LinearGradient>
                    )}
                    </Block>
                </Block>
            </Block>
          </Block>
        </KeyboardAvoidingView>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
  title: {
    marginTop:20
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
  logo: {
    width: 79,
    height: 41,
    zIndex: 2,
    position: 'relative',
    marginTop: '-80%'
  },
});

export default Register;
