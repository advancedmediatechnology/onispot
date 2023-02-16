import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, Image, TouchableWithoutFeedback } from 'react-native';
import { Block, Text, theme } from 'galio-framework';

import { argonTheme } from '../constants';


class Card extends React.Component {
  render() {
    const { navigation, item, subitem, horizontal, full, style, ctaColor, imageStyle, cta, publications, screenavigation } = this.props;
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, styles.shadow, style];
    const imgContainer = [styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
      styles.shadow
    ];
    let name = item.name;
    let cover_url = item.cover_url
    let description = item.description
    if (subitem) {
      name = subitem.name;
      cover_url = subitem.cover_url
      description = subitem.description;
    }

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        <TouchableWithoutFeedback onPress={() => cta && navigation.navigate(screenavigation, { campaign: item._id })}>
          <Block flex style={imgContainer}>
            <Image source={{uri: cover_url}} style={imageStyles} />
          </Block>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => cta && navigation.navigate(screenavigation, { campaign: item._id })}>
          <Block flex space="between" style={styles.cardDescription}>
            <Text size={14} style={styles.cardTitle} bold>{name}</Text>
            <Text size={14} style={styles.cardTitle}>{description}</Text>
            {publications && (<Text size={14} style={styles.cardTitle}>bound posts: {item.publications.length}</Text>)}
            
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

Card.propTypes = {
  item: PropTypes.object,
  subitem: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  cta: PropTypes.bool,
  publications: PropTypes.bool,
  screenavigation: PropTypes.string,
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 120,
    marginBottom: 16
  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
    
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 130,
    width: 'auto',
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

export default withNavigation(Card);