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
import SegmentedControl from '@react-native-segmented-control/segmented-control';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import {BACKEND_PATH} from "@env"


const apiClient = axios.create({
  baseURL: BACKEND_PATH ,
  withCredentials: true,
});

const fileType = {
    0:'image',
    1:'video',
    3:'filter'
};


class CampaignCreativity extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaign:null,
      type:0,
      objcampaign:null,
      isLoading:false,
      isLoadingFile:false,
      fileId:null,
      file:null,
      errorfile:false,
      content:null,
      contenterror:false,
    };
  }

  /* data methods */

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t})
    });
  }

  async updateCampaign() {
    const { navigation } = this.props;
    var status = true;
    
    /*if (!this.state.fileId) {
      this.setState({errorfile: true});
      status = false;
    } else {
      this.setState({errorfile: false});
    }
    if (!status) {
      return
    }*/
    this.setState({isLoading: true});
    var id = (this.state.campaign) ? '/'+ this.state.campaign : '';
    var file_id = null;
    if (this.state.type === 0 || this.state.type === 1 || this.state.type === 3) {
        file_id = this.state.fileId;
    }
    apiClient.post('campaign'+id, { 
        type:this.state.type,
        file_id:file_id,
        content:this.state.content,
    },
    { headers: {Authorization: 'Bearer ' + this.state.token}})
    .then(r => {
      this.setState({isLoading: false});
      if (r.data.status === 1) {
        navigation.navigate("CampaignPrefs", { campaign: r.data.campaign._id });
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
      { headers: {Authorization: 'Bearer ' + this.state.token} })
      .then(r => {
        var file = null;
        if (r.data.type === 0 || r.data.type === 1 || r.data.type === 3) {
            file = {type:fileType[r.data.type]};
        }
        this.setState({
          file:file,
          fileId:r.data.file_id,
          type:r.data.type,
          content:r.data.content,
          objcampaign:r.data
        });
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

  selectPick() {
    if (this.state.type === 3) {
      this.pickDocument();
    } else {
      this.pickImage();
    }
  }

  pickDocument = async () => {
    this.setState({isLoadingFile: true});
    await DocumentPicker.getDocumentAsync({}).then(result => {
      console.log(result);
      if (!result.cancelled) {
        this.setState({file:result});
        this.uploadDocument();
      } else {
        this.setState({isLoadingFile: false});
      }
    });
  }

  pickImage = async () => {
    this.setState({isLoadingFile: true});
    await ImagePicker.requestMediaLibraryPermissionsAsync().then(permissionResult => {
      if (permissionResult.granted === false) {
        alert("You've refused to allow this appp to access your photos!");
        return;
      } 
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0,
      }).then(result => {
        if (!result.cancelled) {
          let filename = result.uri.split('/').pop();
          result.name = filename;
          let type = result.type;
          if (type === 'image') {
            this.setState({type:0});
          }
          if (type === 'video') {
            this.setState({type:1});
          }
          this.setState({file:result});
          console.log(this.state.file);
          this.uploadImage(type);
        } else {
          this.setState({isLoadingFile: false});
        }
      });
    });
  }

  async  uploadImage(witch)  {
    
    let control = this.state.file;
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
        BACKEND_PATH+'image-upload',
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
        console.log(res);
        if (res.status == 1) {
            var file_id = res.image_id;
            this.setState({fileId:file_id})
            this.setState({errorfile:false})
            this.setState({isLoadingFile: false});
        } else {
          this.setState({isLoadingFile: false});
          alert(JSON.stringify(res));
        }
      }).catch(e => { 
        console.log(e);
        this.setState({isLoadingFile: false});
      })
    } else {
      //if no file selected the show alert
      alert('Please Select File first');
    }
  }

  async  uploadDocument()  {
    
    let control = this.state.file;
    if (control != null) {
      //If file selected then create FormData
      const fileToUpload = control;
      const data = new FormData();
      let localUri = fileToUpload.uri;
      let filename = fileToUpload.name
      let type = fileToUpload.mimeType;
      data.append('file_attachment', { uri: localUri, name: filename, type });
      await fetch(
        BACKEND_PATH+'image-upload',
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
        console.log(res);
        if (res.status == 1) {
            var file_id = res.image_id;
            this.setState({fileId:file_id})
            this.setState({errorfile:false})
            this.setState({isLoadingFile: false});
        } else {
          this.setState({isLoadingFile: false});
          alert(JSON.stringify(res));
        }
      }).catch(e => { 
        console.log(e);
        this.setState({isLoadingFile: false});
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
    const { isLoading, file, isLoadingFile, errorfile, content, fileId } = this.state;
    return (
      <Block flex style={styles.container}>
        <ScrollView
            showsVerticalScrollIndicator={false}>
            <Block flex space="between" style={styles.padded}>
                <Block  style={{marginBottom: 24}}>
                    <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 10}}>Type</Text>
                    <SegmentedControl
                        values={['Photo', 'Video', 'Text', 'Filter']}
                        selectedIndex={this.state.type}
                        onChange={(event) => {
                            this.setState({type: event.nativeEvent.selectedSegmentIndex});
                        }}
                    />
                </Block>
                <Block  style={{marginBottom: 20 }}>
                {isLoadingFile  ? <ActivityIndicator/> : (
                    <TouchableOpacity style={{borderWidth:1, borderColor:argonTheme.COLORS[errorfile ? 'INPUT_ERROR' : 'BORDER_COLOR'], borderRadius:4, paddingTop:6}} onPress={() => this.selectPick()}>
                    <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 10}}>Photo, Video or Filter <Icon 
                    family="Feather"
                    size={16}
                    name="upload"
                    color={argonTheme.COLORS[errorfile ? 'INPUT_ERROR' : 'ICON']}
                    /></Text>
                    {fileId && <Block center style={{margin: 10}}><Icon family="Foundation"
                    size={30}
                    name={file.type === 'image' ? 'photo' : (file.type === 'success' ? 'paint-bucket' : 'video')}></Icon><Text>{file.type === 'success' ? 'filter' : file.type}</Text></Block>}
                    </TouchableOpacity>
                    )}
                
                </Block>
                <Block  style={{marginBottom: 20}}>
                    <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 10}}>Content</Text>
                    <TextInput
                        editable
                        multiline
                        style={!this.state.errorcontent ? styles.input : styles.inputError}
                        value={this.state.content}
                        onChange={(e) => this.setState({ content: e.nativeEvent.text })}
                        placeholder="Content"
                      />
                </Block>
                <Block center>
                {isLoading  ? <ActivityIndicator/> : (
                    <LinearGradient 
                      colors={['#66FCF1',  '#46BAB8']}
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
        </ScrollView>
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

export default CampaignCreativity;
