import Shell from 'gi://Shell';

/** Action modes in which both shortcuts can be used. */
const APPLICABLE_ACTION_MODES =
    Shell.ActionMode.NORMAL |
    Shell.ActionMode.OVERVIEW |
    Shell.ActionMode.POPUP;

export default APPLICABLE_ACTION_MODES;
