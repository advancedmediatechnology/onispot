import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import {
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";


const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

class CampaignPrefs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaign:null,
      objcampaign:null,
      isLoading: false,
      isLogged: false,
      prefcategories:[],
      prefstyles:[],
      categories:[],
      appstyles:[],
    };
  }

  /* data methods */

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
    });
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
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async updateCampaign() {
    const { navigation } = this.props;
    this.setState({isLoading: true});
    var id = (this.state.campaign) ? '/'+ this.state.campaign : '';
    apiClient.post('campaign'+id, { 
      styles:this.state.prefstyles,
      categories:this.state.prefcategories,
    },
    { headers: {Authorization: 'Bearer ' + this.state.token}})
    .then(r => {
      this.setState({isLoading: false});
      if (r.data.status === 1) {
        navigation.navigate("CampaignTarget", { campaign: r.data.campaign._id });
      } else {
        alert('unsuccessufull');
      }
    })
    .catch(e => { 
      console.log(e);
      this.setState({isLoading: false});
    })
    .finally(()=>{
      this.setState({isLoading: false});
    })
  }

  async getCampaign(campaign) {
    try {
      apiClient.get('campaign/'+campaign, 
      { },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        this.setState({objcampaign:r.data})
        if (r.data.categories) {
          this.setState({prefcategories:r.data.categories})
        }
        if (r.data.styles) {
          this.setState({prefstyles:r.data.styles})
        }
        this.getCategories();
        this.getStyles();
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };

  }

  checkBoxCategories(val) {
    if (this.state.prefcategories.includes(val)){
      this.state.prefcategories.splice(this.state.prefcategories.indexOf(val), 1);
    } else {
      this.state.prefcategories.push(val);
    }
  }

  checkBoxStyles(val) {
    if (this.state.prefstyles.includes(val)){
      this.state.prefstyles.splice(this.state.prefstyles.indexOf(val), 1);
    } else {
      this.state.prefstyles.push(val);
    }
  }

  /* lifeCycle */

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    try {
      const { campaign } = this.props.route.params
      //Ensuring This is not the first call to the server
      if(campaign && campaign !== this.state.campaign) {
        this.setState({campaign:campaign});
        this.getCampaign(campaign); // Get the new Project when project id Change on Url
      }
    } catch(error) {
      console.log(error);
    };
  }

  componentDidMount() {
    this.getToken();
  }

  /* renderes */

  renderSubCheckBoxCategories = (item, index) => {
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={this.state.objcampaign.categories ? this.state.objcampaign.categories.includes(item.id) : null}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxCategories = (item, index) => {
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxCategories(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={this.state.objcampaign.categories ? this.state.objcampaign.categories.includes(item.id) : null}
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
    return (
      <Block style={{marginVertical:5,marginHorizontal:30}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={this.state.objcampaign.styles ? this.state.objcampaign.styles.includes(item.id) : null}
            label={item.name}
        />
      </Block>
    )
  }

  renderCheckBoxStyles = (item, index) => {
    return (
      <Block style={{margin:10}} key={item.id}>
        <Checkbox
            checkboxStyle={{
              borderWidth: 3
            }}
            onChange={() => this.checkBoxStyles(item.id)}
            color={argonTheme.COLORS.PRIMARY}
            initialValue={this.state.objcampaign.styles ? this.state.objcampaign.styles.includes(item.id) : null}
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
        <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 0}}>Categories</Text>
        <Block flex center style={{margin:20}}>
          <ScrollView
            showsVerticalScrollIndicator={true}>
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
        <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 0}}>Styles</Text>
        <Block flex center style={{margin:20}}>
          <ScrollView
            showsVerticalScrollIndicator={true}>
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
    const { isLoading, isLogged, file, cover, isLoadingImage, campaign } = this.state;
    return (
      <Block flex style={styles.container}>
          <Block flex space="between" style={styles.padded}>
            {this.renderPreferences()}
            {this.renderStyles()}
            <Block center>
                    {isLoading  ? <ActivityIndicator/> : (
                      <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                        style={{borderRadius: 30}} 
                        start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                        <Button
                          style={styles.button}
                          color='transparent'
                          padding='0 0 0 0'
                          onPress={() => this.updateCampaign()}
                          textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                        >
                          NEXT
                        </Button>
                      </LinearGradient>
                    )}
              </Block>
          </Block>
      </Block>
    );
    
  }

  render() {
    return this.renderPersonal();
  }

}

const styles = StyleSheet.create({
  input: {
    borderRadius: 4,
    margin: 0,
    paddingTop:12,
    paddingBottom:12,
    paddingLeft:16,
    paddingRight:16,
    borderColor: argonTheme.COLORS.BORDER,
    backgroundColor: '#F7FAFC'
  },
  inputError: {
    borderRadius: 4,
    margin: 0,
    paddingTop:12,
    paddingBottom:12,
    paddingLeft:16,
    paddingRight:16,
    borderColor: argonTheme.COLORS.BORDER,
    backgroundColor: '#F7FAFC',
    borderWidth:1,
    borderColor: argonTheme.COLORS.INPUT_ERROR,
  },
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  padded: {
    paddingTop:30,
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

export default CampaignPrefs;
