import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import Markdown from 'react-markdown';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import { Public } from '@material-ui/icons';
import inject18n from '../../../components/i18n';

const styles = theme => ({
  card: {
    width: '100%',
    height: 170,
    borderRadius: 6,
  },
  cardDummy: {
    width: '100%',
    height: 170,
    color: theme.palette.grey[700],
    borderRadius: 6,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    backgroundColor: theme.palette.grey[600],
  },
  icon: {
    margin: '10px 20px 0 0',
    fontSize: 40,
    color: '#242d30',
  },
  area: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingBottom: 0,
    marginBottom: 0,
  },
  content: {
    width: '100%',
    height: 89,
    overflow: 'hidden',
    paddingTop: 0,
  },
  contentDummy: {
    width: '100%',
    height: 89,
    overflow: 'hidden',
    marginTop: 15,
  },
  placeholderHeader: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[700],
  },
  placeholderHeaderDark: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[800],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class ThreatActorCardComponent extends Component {
  render() {
    const {
      t, fsd, classes, threatActor,
    } = this.props;
    return (
      <Card classes={{ root: classes.card }} raised={true}>
        <CardActionArea
          classes={{ root: classes.area }}
          component={Link}
          to={`/dashboard/threats/threat_actors/${threatActor.id}`}
        >
          <CardHeader
            classes={{ root: classes.header }}
            avatar={
              <Avatar className={classes.avatar}>
                {threatActor.name.charAt(0)}
              </Avatar>
            }
            title={threatActor.name}
            subheader={`${t('Updated the')} ${fsd(threatActor.modified)}`}
            action={<Public className={classes.icon} />}
          />
          <CardContent classes={{ root: classes.content }}>
            <Markdown
              source={threatActor.description}
              disallowedTypes={['link', 'linkReference']}
              unwrapDisallowed={true}
            />
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

ThreatActorCardComponent.propTypes = {
  threatActor: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fsd: PropTypes.func,
};

const ThreatActorCardFragment = createFragmentContainer(
  ThreatActorCardComponent,
  {
    threatActor: graphql`
      fragment ThreatActorCard_threatActor on ThreatActor {
        id
        name
        description
        created
        modified
      }
    `,
  },
);

export const ThreatActorCard = compose(
  inject18n,
  withStyles(styles),
)(ThreatActorCardFragment);

class ThreatActorCardDummyComponent extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Card classes={{ root: classes.cardDummy }} raised={true}>
        <CardActionArea classes={{ root: classes.area }}>
          <CardHeader
            classes={{ root: classes.header }}
            avatar={<Avatar className={classes.avatarDisabled}>D</Avatar>}
            title={
              <div
                className={classes.placeholderHeader}
                style={{ width: '85%' }}
              />
            }
            titleTypographyProps={{ color: 'inherit' }}
            subheader={
              <div
                className={classes.placeholderHeaderDark}
                style={{ width: '70%' }}
              />
            }
            action={<Public className={classes.icon} />}
          />
          <CardContent classes={{ root: classes.contentDummy }}>
            <div className="fakeItem" style={{ width: '90%' }} />
            <div className="fakeItem" style={{ width: '95%' }} />
            <div className="fakeItem" style={{ width: '90%' }} />
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

ThreatActorCardDummyComponent.propTypes = {
  classes: PropTypes.object,
};

export const ThreatActorCardDummy = compose(
  inject18n,
  withStyles(styles),
)(ThreatActorCardDummyComponent);
