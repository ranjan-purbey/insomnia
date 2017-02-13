import React, {Component, PropTypes} from 'react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {shell} from 'electron';
import Modal from '../base/Modal';
import Button from '../base/Button';
import ModalBody from '../base/ModalBody';
import ModalHeader from '../base/ModalHeader';
import SettingsShortcuts from '../settings/SettingsShortcuts';
import SettingsAbout from '../settings/SettingsAbout';
import SettingsGeneral from '../settings/SettingsGeneral';
import SettingsImportExport from '../settings/SettingsImportExport';
import SettingsTheme from '../settings/SettingsTheme';
import * as models from '../../../models/index';
import {getAppVersion, getAppName} from '../../../common/constants';
import {trackEvent} from '../../../analytics/index';
import * as session from '../../../sync/session';

export const TAB_INDEX_EXPORT = 1;

class SettingsModal extends Component {
  constructor (props) {
    super(props);
    this._currentTabIndex = -1;
    this.state = {}
  }

  _setModalRef = m => this.modal = m;
  _trackTab = name => trackEvent('Setting', `Tab ${name}`);
  _handleTabSelect = currentTabIndex => this.setState({currentTabIndex});
  _handleUpdateSetting = (key, value) => {
    models.settings.update(this.props.settings, {[key]: value});
    trackEvent('Setting', 'Change', key)
  };

  _handleExportAllToFile = () => {
    this.props.handleExportAllToFile();
    this.modal.hide()
  };

  _handleExportWorkspace = () => {
    this.props.handleExportWorkspaceToFile();
    this.modal.hide()
  };

  _handleImport = () => {
    this.props.handleImportFile();
    this.modal.hide()
  };

  _handleChangeTheme = (theme, track = true) => {
    document.body.setAttribute('theme', theme);
    models.settings.update(this.props.settings, {theme});

    if (track) {
      trackEvent('Setting', 'Change Theme', theme)
    }
  };

  componentDidMount () {
    // Hacky way to set theme on launch
    // TODO: move somewhere else
    this._handleChangeTheme(this.props.settings.theme, false);
  }

  show (currentTabIndex = 0) {
    this.setState({currentTabIndex});
    this.modal.show();
  }

  hide () {
    this.modal.hide();
  }

  toggle (currentTabIndex = 0) {
    this.setState({currentTabIndex});
    this.modal.toggle();
  }

  render () {
    const {settings} = this.props;
    const {currentTabIndex} = this.state;
    const email = session.isLoggedIn() ? session.getEmail() : null;

    return (
      <Modal ref={this._setModalRef} tall={true} {...this.props}>
        <ModalHeader>
          {getAppName()} Preferences
          <span className="faint txt-sm">
          &nbsp;&nbsp;–&nbsp;
            v{getAppVersion()}
            {email ? ` – ${email}` : null}
          </span>
        </ModalHeader>
        <ModalBody noScroll={true}>
          <Tabs onSelect={this._handleTabSelect} selectedIndex={currentTabIndex}>
            <TabList>
              <Tab selected={this._currentTabIndex === 0}>
                <Button value="General" onClick={this._trackTab}>
                  General
                </Button>
              </Tab>
              <Tab selected={this._currentTabIndex === 1}>
                <Button value="Import/Export" onClick={this._trackTab}>
                  Import/Export
                </Button>
              </Tab>
              <Tab selected={this._currentTabIndex === 2}>
                <Button value="Themes" onClick={this._trackTab}>
                  Themes
                </Button>
              </Tab>
              <Tab selected={this._currentTabIndex === 3}>
                <Button value="shortcuts" onClick={this._trackTab}>
                  Shortcuts
                </Button>
              </Tab>
              <Tab selected={this._currentTabIndex === 4}>
                <Button value="About" onClick={this._trackTab}>
                  About
                </Button>
              </Tab>
            </TabList>
            <TabPanel className="pad scrollable">
              <SettingsGeneral
                settings={settings}
                updateSetting={this._handleUpdateSetting}
              />
            </TabPanel>
            <TabPanel className="pad scrollable">
              <SettingsImportExport
                handleExportAll={this._handleExportAllToFile}
                handleExportWorkspace={this._handleExportWorkspace}
                handleImport={this._handleImport}
              />
            </TabPanel>
            <TabPanel className="pad scrollable">
              <SettingsTheme
                handleChangeTheme={this._handleChangeTheme}
                activeTheme={settings.theme}
              />
            </TabPanel>
            <TabPanel className="pad scrollable">
              <SettingsShortcuts />
            </TabPanel>
            <TabPanel className="pad scrollable">
              <SettingsAbout/>
            </TabPanel>
          </Tabs>
        </ModalBody>
      </Modal>
    );
  }
}

SettingsModal.propTypes = {
  // Functions
  handleExportWorkspaceToFile: PropTypes.func.isRequired,
  handleExportAllToFile: PropTypes.func.isRequired,
  handleImportFile: PropTypes.func.isRequired,

  // Properties
  settings: PropTypes.object.isRequired,
};

export default SettingsModal;
