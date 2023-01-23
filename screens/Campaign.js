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


class Campaign extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaign:null,
      email: '',
      erroremail:false,
      password: '',
      errorpass:false,
      name:'',
      errorname:false,
      description: '',
      errordescription:false,
      coverId:null,
      errorcover:null,
      isLoading: false,
      isLoadingImage: false,
      isLogged: false,
      cover:null,
      objcampaign:null,
    };
  }

  /* data methods */

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
    });
  }

  async createCampaign() {
    const { navigation } = this.props;
    var status = true;
    if (this.state.name === '') {
      this.setState({errorname: true});
      status = false;
    } else {
      this.setState({errorname: false});
    }
    if (this.state.description === '') {
      this.setState({errordescription: true});
      status = false;
    } else {
      this.setState({errordescription: false});
    }
    if (!this.state.coverId) {
      this.setState({errorcover: true});
      status = false;
    } else {
      this.setState({errorcover: false});
    }
    if (!status) {
      return
    }
    this.setState({isLoading: true});
    var id = (this.state.campaign) ? '/'+ this.state.campaign : '';
    apiClient.post('campaign'+id, { 
      name:this.state.name,
      description:this.state.description,
      cover_id:this.state.coverId,
    },
    { headers: {Authorization: 'Bearer ' + this.state.token}})
    .then(r => {
      this.setState({isLoading: false});
      if (r.data.status === 1) {
        navigation.navigate("CampaignCreativity", { campaign: r.data.campaign._id });
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
        let cover = r.data.cover_url ? {uri:r.data.cover_url} : null;
        this.setState({
          name:r.data.name, 
          description:r.data.description,
          cover:cover,
          coverId:r.data.cover_id,
          objcampaign:r.data
        })
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  /* update interfaces */

  getPlaceHolder(witch, statusfielderror, message) {
    if (!statusfielderror) {
      return witch;
    } else {
      return witch + " " + message;
    }
  }

  /* uploads */

  pickDocument = async () => {
    await DocumentPicker.getDocumentAsync({}).then(result => {
      this.setState({file:result});
      this.uploadImage();
    });
  }

  pickImage = async () => {
    this.setState({isLoadingImage: true});
    await ImagePicker.requestMediaLibraryPermissionsAsync().then(permissionResult => {
      if (permissionResult.granted === false) {
        alert("You've refused to allow this appp to access your photos!");
        return;
      } 
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0,
      }).then(result => {
        if (!result.cancelled) {
          let filename = result.uri.split('/').pop();
          result.name = filename;
          this.setState({cover:result});
          this.uploadImage('image');
        } else {
          this.setState({isLoadingImage: false});
        }
      });
    });
  }

  pickVideo = async () => {
    this.setState({isLoading: true});
    await ImagePicker.requestMediaLibraryPermissionsAsync().then(permissionResult => {
      if (permissionResult.granted === false) {
        alert("You've refused to allow this appp to access your photos!");
        return;
      } 
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
      }).then(result => {
        let filename = result.uri.split('/').pop();
        result.name = filename;
        this.setState({file:result});
        this.uploadImage('video');
      });
    });
  }

  async  uploadImage(witch)  {
    //Check if any file is selected or not
    let control = null;
    if (witch === 'image') {
      control = this.state.cover;
    } else {
      control = this.state.file;
    }
    if (control != null) {
      //If file selected then create FormData
      const fileToUpload = control;
      const data = new FormData();
      let localUri = fileToUpload.uri;
      let filename = localUri.split('/').pop();
      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? witch + `/${match[1]}` : witch;
      data.append('file_attachment', { uri: localUri, name: filename, type });
      await fetch(
        'http://test.onispot.com/api/'+witch+'-upload',
        {
          method: 'post',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data; ',
            'Authorization': 'Bearer ' + this.state.token
          },
      })
      .then((r)=>r.json())
      .then(res => {
        if (res.status == 1) {
          if (witch === 'image') {
            this.setState({coverId:res.image_id})
            this.setState({errorcover:false})
            this.setState({isLoadingImage: false});
          } else {
            this.setState({fileId:res.image_id})
          }
        } else {
          this.setState({isLoadingImage: false});
          alert(JSON.stringify(res));
        }
      }).catch(e => { 
        console.log(e);
        this.setState({isLoadingImage: false});
      })
    } else {
      //if no file selected the show alert
      alert('Please Select File first');
    }
  }

  /* lifecycle */

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

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getToken();
  }

  /* renderers */

  renderPersonal = () => {
    const { isLoading, isLogged, file, cover, isLoadingImage, errorcover } = this.state;
    return (
      <Block flex style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled
        >
        <ScrollView
            showsVerticalScrollIndicator={false}>
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
                    <Block style={{marginBottom: 24 }}>
                    <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 10}}>Description</Text>
                    <TextInput
                        editable
                        multiline
                        style={!this.state.errordescription ? styles.input : styles.inputError}
                        value={this.state.description}
                        onChange={(e) => this.setState({ description: e.nativeEvent.text })}
                        placeholder={this.getPlaceHolder('Description',this.state.errordescription, 'required')}
                      />
                    </Block>
                    <Block  style={{marginBottom: 20 }}>
                    {isLoadingImage  ? <ActivityIndicator/> : (
                      <TouchableOpacity style={{borderWidth:1, borderColor:argonTheme.COLORS[errorcover ? 'INPUT_ERROR' : 'BORDER_COLOR'], borderRadius:4, paddingTop:6}} onPress={() => this.pickImage()}>
                      <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 10}}>Cover <Icon 
                        family="Feather"
                        size={16}
                        name="upload"
                        color={argonTheme.COLORS[errorcover ? 'INPUT_ERROR' : 'ICON']}
                      /></Text>
                      {cover && <Block center style={{marginTop: 10, margingBottom:10}}><Image source={{ uri: cover.uri }} style={{ width: 200, height: 200, marginBottom:20 }} /></Block>}
                      </TouchableOpacity>
                      )}
                    
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
                          onPress={() => this.createCampaign()}
                          textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                        >
                          NEXT
                        </Button>
                      </LinearGradient>
                    )}
                    </Block>
                </Block>
              </Block>
          </Block>
          
        </ScrollView>
        </KeyboardAvoidingView>
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

export default Campaign;
