import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import prefs from "../constants/preferences"
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";


const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
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
      isLogged: false,
      tabScreen:'personal',
      categories:[],
      prefcategories:[],
      appstyles:[],
      prefstyles:[]
    };
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
        this.getUser()
    });
  }

  getPlaceHolder(witch, statusfielderror, message) {
    if (!statusfielderror) {
      return witch;
    } else {
      return witch + " " + message;
    }
  }

  async updateuser(name) {
    var status = true;
    if (name === '') {
      this.setState({errorname: true});
      status = false;
    } else {
      this.setState({errorname: false});
    }
    if (!status) {
      return
    }
    this.setState({isLoading: true});
    apiClient.post('update', { 
      name
    })
    .then(r => {
      console.log(r);
      //this.setState({token: r.data.token});
      //SecureStore.setItemAsync('secure_token',r.data.token);
      //this.setState({isLoading: false});
      
    })
    .catch(e => { 
      console.log(e);
      this.setState({isLoading: false});
    })
    .finally(()=>{
      this.setState({isLoading: false});
    })
  }

  checkBoxCategories(val) {
    console.log('categories');
    if (this.state.prefcategories.includes(val)){
      this.state.prefcategories.splice(this.state.prefcategories.indexOf(val), 1);
    } else {
      this.state.prefcategories.push(val);
    }
    console.log(this.state.prefcategories);
    this.postCategories();
  }

  checkBoxStyles(val) {
    console.log('styles');
    if (this.state.prefstyles.includes(val)){
      this.state.prefstyles.splice(this.state.prefstyles.indexOf(val), 1);
    } else {
      this.state.prefstyles.push(val);
    }
    console.log(this.state.prefstyles);
    this.postStyles();
}

  async postCategories() {
      apiClient.post('categories', 
      { categories: this.state.prefcategories },
      { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
        this.setState({ prefcategories: r.data.categories });
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{})
  }

  async postStyles() {
    apiClient.post('styles', 
    { styles: this.state.prefstyles },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      this.setState({ prefstyles: r.data.styles });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
}

  async getUser() {
    apiClient.post('user', 
    { },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      console.log(r.data);
      this.setState({ prefcategories: r.data.categories, prefstyles: r.data.styles, name: r.data.name });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  async getCategories() {
    try {
      const response = await fetch('http://test.onispot.com/api/categories');
      const json = await response.json();
      this.setState({ categories: json });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async getStyles() {
    try {
      const response = await fetch('http://test.onispot.com/api/styles');
      const json = await response.json();
      this.setState({ appstyles: json });
      console.log(this.state.appstyles);
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  componentDidUpdate(prevProp, prevState) {
  }

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getCategories();
    this.getStyles();
    this.getToken();
  }

  renderSubCheckBoxCategories = (item, index) => {
    const { prefcategories } = this.state;
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefcategories.includes(item.id)}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxCategories = (item, index) => {
    const { prefcategories } = this.state;
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefcategories.includes(item.id)}
            label={item.name}
        />
        {
          item.children && 
          item.children.map(
            (item, index) =>
              this.renderSubCheckBoxCategories(item, index)
            )
        }
      </Block>
    )
  }

  renderSubCheckBoxStyles = (item, index) => {
    const { prefstyles } = this.state;
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefstyles.includes(item.id)}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxStyles = (item, index) => {
    const { prefstyles } = this.state;
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={prefstyles.includes(item.id)}
            label={item.name}
        />
        {
          item.children && 
          item.children.map(
            (item, index) =>
              this.renderSubCheckBoxStyles(item, index)
            )
        }
      </Block>
    )
  }

  renderPreferences = () => {
    const { categories } = this.state;
    return (
      <Block flex style={styles.container}>
        <Block flex center style={{margin:20}}>
        <Text>Categories</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}>
            <Block flex>
              {categories.length > 0  &&
                categories.map((item, index) =>
                  this.renderCheckBoxCategories(item, index)
                )
              }
            </Block>
          </ScrollView>
        </Block>
      </Block>
    )
  }

  renderStyles = () => {
    const { appstyles } = this.state;
    return (
      <Block flex style={styles.container}>
        <Block flex center style={{margin:20}}>
          <Text>Styles</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}>
            <Block flex>
              {appstyles.length > 0  &&
                appstyles.map((item, index) =>
                  this.renderCheckBoxStyles(item, index)
                )
              }
            </Block>
          </ScrollView>
        </Block>
      </Block>
    )
  }

  renderPersonal = () => {
    const { isLoading, isLogged } = this.state;
    return (
      <Block flex style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled
        >
          <Block flex space="between" style={styles.padded}>
            <Block flex space="around" style={{ zIndex: 2 }}>
                <Block flex style={styles.title}>
                    <Block  style={{marginBottom: 10}}>
                      <Input
                        label='Name'
                        value={this.state.name}
                        onChange={(e) => this.setState({ name: e.nativeEvent.text })}
                        error={this.state.errorname}
                        borderless={!this.state.errorname}
                        placeholder={this.getPlaceHolder('Name',this.state.errorname, 'required')}
                      />
                    </Block>
                    <Block style={{marginBottom: 20}}>
                      <Text></Text>
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
                          onPress={() => this.updateuser(this.state.name)}
                          textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                        >
                          UPDATE
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

  render() {
    const { navigation } = this.props;
    var screen = 'personal';
    try {
        screen = this.props.route.params.tabId;
    } catch(error) {
        console.log(error);
    };
    switch (screen) {
      case 'personal':
        return this.renderPersonal();
        break;
      case 'preferences':
        return this.renderPreferences();
        break;
      case 'styles':
        return this.renderStyles();
        break;
      default:
        return this.renderPersonal();
        break;
    }
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
    marginTop:'10%'
  },
  subCheckbox: {
    paddingLeft: 20
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
    marginTop: '30%'
  },
});

export default Account;
