export const defaultStyles = {
  container: {
    position: 'relative',
    display: 'inline-block',
    width: 24,
    height: 14,
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none'
  },

  containerDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },

  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 7,
    backgroundColor: '#cccccc'
  },

  trackChecked: {
    backgroundColor: '#5e72e4'
  },

  button: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    right: 11,
    left: 2,
    backgroundColor: '#fff',
    borderRadius: 9,
    transition: 'all 100ms ease'
  },

  buttonChecked: {
    right: 2,
    left: 11
  }
};

type SwitcherProps = {
  checked: boolean
  disabled: boolean
  onChange: (checked: boolean) => void
  name: string
}

// Switch.defaultProps = {
//   value: 1,
//   on: 1,
//   off: 0,
//   disabled: false,
//   styles: {}
// };


const Switcher = ({
  checked,
  onChange,
  name,
  disabled,
  ...props
}: SwitcherProps) => {

  return (
    <label
      {...props}
      // css={[styles.container, disabled && styles.containerDisabled]}
      className={'relative inline-block w-6 h-6 align-middle cursor-pointer select-none ' + disabled ? 'opacity-70 cursor-not-allowed' : '' }
      onClick={disabled ? undefined : () => onChange(!!checked)}
    >
      <input type="hidden" name={name} value={checked ? 1 : 0} />
      {/* <span css={[styles.track, checked && styles.trackChecked]} /> */}
      <span className={'absolute top-0 left-0 bottom-0 right-0 rounded-lg bg-gray-200 ' + checked ? 'bg-purple-400' : '' } />
      {/* <span css={[styles.button, checked && styles.buttonChecked]} /> */}
      <span className={'absolute top-1 bottom-1 right-3 left-1 bg-white rounded-lg transition-all duration-100 ' + checked ? ' right-1 left-3 ' : ''} />
    </label>
  );
};

export default Switcher;
