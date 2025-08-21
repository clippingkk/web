type LoadingIconProps = {
  className?: string
}

function LoadingIcon(props: LoadingIconProps) {
  return (
    <div className={props.className}>
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          opacity='0.5'
          fillRule='evenodd'
          clipRule='evenodd'
          d='M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM20.865 12C20.865 7.10146 16.894 3.13042 11.9954 3.13042C7.09692 3.13042 3.12588 7.10146 3.12588 12C3.12588 16.8985 7.09692 20.8695 11.9954 20.8695C16.894 20.8695 20.865 16.8985 20.865 12Z'
          fill='white'
        />
        <path
          d='M12 0C12.8644 0 13.5652 0.700772 13.5652 1.56522C13.5652 2.42966 12.8644 3.13043 12 3.13043C7.10147 3.13043 3.13043 7.10147 3.13043 12C3.13043 12.8644 2.42966 13.5652 1.56522 13.5652C0.700772 13.5652 0 12.8644 0 12C0 5.37258 5.37258 0 12 0Z'
          fill='#005ca5'
        />
      </svg>
    </div>
  )
}

export default LoadingIcon
