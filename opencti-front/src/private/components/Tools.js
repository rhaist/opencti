/* eslint-disable no-nested-ternary */
// TODO Remove no-nested-ternary
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  assoc, compose, defaultTo, lensProp, map, over, pipe,
} from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import { ArrowDropDown, ArrowDropUp, TableChart } from '@material-ui/icons';
import { fetchQuery, QueryRenderer } from '../../relay/environment';
import inject18n from '../../components/i18n';
import SearchInput from '../../components/SearchInput';
import StixDomainEntitiesImportData from './stix_domain_entity/StixDomainEntitiesImportData';
import StixDomainEntitiesExportData from './stix_domain_entity/StixDomainEntitiesExportData';
import ToolsLines, { toolsLinesQuery } from './tool/ToolsLines';
import ToolCreation from './tool/ToolCreation';
import { dateFormat } from '../../utils/Time';

const styles = () => ({
  header: {
    margin: '0 0 10px 0',
  },
  linesContainer: {
    marginTop: 0,
    paddingTop: 0,
  },
  item: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  inputLabel: {
    float: 'left',
  },
  sortField: {
    float: 'left',
  },
  sortFieldLabel: {
    margin: '12px 15px 0 0',
    fontSize: 14,
    float: 'left',
  },
  sortIcon: {
    float: 'left',
    margin: '-5px 0 0 15px',
  },
});

const inlineStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  name: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
  tool_version: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  created: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  modified: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const exportToolsQuery = graphql`
  query ToolsExportToolsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ToolsOrdering
    $orderMode: OrderingMode
  ) {
    tools(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) @connection(key: "Pagination_tools") {
      edges {
        node {
          id
          name
          description
          tool_version
          created
          modified
        }
      }
    }
  }
`;

class Tools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'name',
      orderAsc: true,
      searchTerm: '',
      view: 'lines',
      csvData: null,
    };
  }

  handleChangeView(mode) {
    this.setState({ view: mode });
  }

  handleSearch(value) {
    this.setState({ searchTerm: value });
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  SortHeader(field, label) {
    const { t } = this.props;
    return (
      <div
        style={inlineStyles[field]}
        onClick={this.reverseBy.bind(this, field)}
      >
        <span>{t(label)}</span>
        {this.state.sortBy === field ? (
          this.state.orderAsc ? (
            <ArrowDropDown style={inlineStyles.iconSort} />
          ) : (
            <ArrowDropUp style={inlineStyles.iconSort} />
          )
        ) : (
          ''
        )}
      </div>
    );
  }

  handleGenerateCSV() {
    this.setState({ csvData: null });
    const paginationOptions = {
      orderBy: this.state.sortBy,
      orderMode: this.state.orderAsc ? 'asc' : 'desc',
    };
    fetchQuery(exportToolsQuery, { count: 90000, ...paginationOptions }).then(
      (data) => {
        const finalData = pipe(
          map(n => n.node),
          map(n => over(lensProp('description'), defaultTo('-'))(n)),
          map(n => assoc('created', dateFormat(n.created))(n)),
          map(n => assoc('modified', dateFormat(n.modified))(n)),
        )(data.tools.edges);
        this.setState({ csvData: finalData });
      },
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.header}>
          <div style={{ float: 'left', marginTop: -10 }}>
            <SearchInput
              variant="small"
              onChange={this.handleSearch.bind(this)}
            />
          </div>
          <div style={{ float: 'right', marginTop: -20 }}>
            <IconButton
              color={this.state.view === 'lines' ? 'secondary' : 'primary'}
              classes={{ root: classes.button }}
              onClick={this.handleChangeView.bind(this, 'lines')}
            >
              <TableChart />
            </IconButton>
            <StixDomainEntitiesImportData />
            <StixDomainEntitiesExportData
              fileName="Tools"
              handleGenerateCSV={this.handleGenerateCSV.bind(this)}
              csvData={this.state.csvData}
            />
          </div>
          <div className="clearfix" />
        </div>
        <List classes={{ root: classes.linesContainer }}>
          <ListItem
            classes={{ root: classes.item }}
            divider={false}
            style={{ paddingTop: 0 }}
          >
            <ListItemIcon>
              <span
                style={{
                  padding: '0 8px 0 8px',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                #
              </span>
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  {this.SortHeader('name', 'Name')}
                  {this.SortHeader('tool_version', 'Version')}
                  {this.SortHeader('created', 'Creation date')}
                  {this.SortHeader('modified', 'Modification date')}
                </div>
              }
            />
          </ListItem>
          <QueryRenderer
            query={toolsLinesQuery}
            variables={{
              count: 25,
              orderBy: this.state.sortBy,
              orderMode: this.state.orderAsc ? 'asc' : 'desc',
            }}
            render={({ props }) => {
              if (props) {
                return (
                  <ToolsLines data={props} searchTerm={this.state.searchTerm} />
                );
              }
              return (
                <ToolsLines
                  data={null}
                  dummy={true}
                  searchTerm={this.state.searchTerm}
                />
              );
            }}
          />
        </List>
        <ToolCreation
          paginationOptions={{
            orderBy: this.state.sortBy,
            orderMode: this.state.orderAsc ? 'asc' : 'desc',
          }}
        />
      </div>
    );
  }
}

Tools.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withStyles(styles),
)(Tools);
