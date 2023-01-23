import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Block, Text, Button, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";



class Onboarding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      erroremail:false,
      password: '',
      errorpass:false,
      username:'',
      token: '',
      isLoading: false,
      isLogged: false
    };
  }

  getPlaceHolder(witch, statusfielderror, message) {
    if (!statusfielderror) {
      return witch;
    } else {
      return witch + " " + message;
    }
  }

  async logout() {
    await SecureStore.deleteItemAsync('secure_token');
  }

  async login(email, password) {
    const { navigation } = this.props;
    var status = true;
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
    if (!status) {
      return
    }
    const apiClient = axios.create({
      baseURL: 'http://test.onispot.com/api/' ,
      withCredentials: true,
    });
    this.setState({isLoading: true});
    apiClient.get('csrf-cookie')
      .then(r => { 
        console.log(r);
        apiClient.post('login', { 
          email, password
        })
        .then(r => {
          console.log(r.data);
          this.setState({username: r.data.user.name});
          this.setState({token: r.data.token});
          SecureStore.setItemAsync('secure_token',r.data.token);
          this.setState({isLoading: false});
          navigation.navigate('App', { screen: 'Home' });
        })
        .catch(e => { 
          if (e.message.includes('401')) {
            alert('user not present');
          } else {
            alert('bad request');
          }
          console.log(e);
          this.setState({isLoading: false});
        })
        .finally(()=>{
          this.setState({isLoading: false});
        })
      })
  }

  async getToken() {
    const { navigation } = this.props;
    const token = await SecureStore.getItemAsync('secure_token');
    if (token) {
      this.setState({isLogged: true});
      navigation.navigate('App', { screen: 'Home' });
    }
  }

  componentDidMount() {
    this.getToken();
  }
  
 render() {
    const { navigation } = this.props;
    const { isLoading, isLogged } = this.state;
    
    return (
      <Block flex style={styles.container}>
          <Block flex center >
            
          </Block>
          <KeyboardAvoidingView 
              style={{flex:1}}
              behavior="padding"
              enabled
            >
              <Block flex center space="between" style={styles.padded}>
                <Image source={Images.LogoOnboarding} style={styles.logo} />
                <Block flex space="around" style={{ zIndex: 2 }}>
                    <Block flex style={styles.title}>
                      
                      {isLogged  ? (
                      <Block>
                        <Button
                          style={styles.button}
                          color={argonTheme.COLORS.SECONDARY}
                          onPress={() => this.logout()}
                          textStyle={{ color: argonTheme.COLORS.BLACK }}
                        >
                          logout 
                        </Button>
                        <Button
                          style={styles.button}
                          color={argonTheme.COLORS.SECONDARY}
                          onPress={() => navigation.navigate('App', { screen: 'Home' })}
                          textStyle={{ color: argonTheme.COLORS.BLACK }}
                        >
                          Get started 
                        </Button>
                      </Block>) : (
                        <Block>
                                <Block style={{marginBottom: 10}}>
                                <Input
                                    onChange={(e) => this.setState({ email: e.nativeEvent.text })}
                                    error={this.state.erroremail}
                                    borderless={!this.state.erroremail}
                                    placeholder={this.getPlaceHolder('Email',this.state.erroremail, 'required')}
                                />
                            </Block>
                            <Block style={{marginBottom: 20}}>
                                  <Input
                                    password
                                    onChange={(e) => this.setState({ password: e.nativeEvent.text })}
                                    error={this.state.errorpass}
                                    borderless={!this.state.errorpass}
                                    placeholder={this.getPlaceHolder('Password', this.state.errorpass, 'required')}
                                  />
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
                                    onPress={() => this.login(this.state.email, this.state.password)}
                                    textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                                  >
                                    LOGIN 
                                  </Button>
                                </LinearGradient>
                              )}
                            </Block>
                                <Block center style={{marginTop: 20}}>
                                  <Text
                                    size={16}
                                    color={argonTheme.COLORS.PRIMARY}
                                    onPress={() => navigation.navigate("Register")}
                                  >
                                    Don't have an account? Sign in
                                  </Text>
                                </Block>
                        </Block>
                        ) 
                      }
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
    position: "relative",
    marginTop: '-80%'
  },
  title: {
    marginTop:20,
    width: width - theme.SIZES.BASE * 4,
  },
});

export default Onboarding;
