import Swal from 'sweetalert2';

export default function sweetalert() {
  
  const activeAlerts = {};
  const intervals = {};

  const successAlert = (text) => {
    Swal.fire({
      title: 'Success',
      text,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  const errorAlert = (text) => {
    Swal.fire({
      title: 'Error',
      text,
      icon: 'error',
      confirmButtonText: 'Accept'
    });
  };

  const confirmAlert = (text, callback) => {
    return Swal.fire({
      title: 'Confirm',
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    })
  };

  const promptAlert = async (title, inputOptions, inputValue) => {
    return Swal.fire({
      title,
      input: 'select',
      inputOptions,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'Change',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'shadow-lg rounded-3',
        title: 'h5',
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary',
        input: 'form-select w-75 mx-auto',
      },
      buttonsStyling: false,
    });
  };

  const cooldownAlert = (site, remainingTime, session) => {
    Swal.fire({
      title: 'Please wait!',
      html: `You need to wait <b>${remainingTime}</b> seconds before taking another screenshot.`,
      icon: 'warning',
      timer: remainingTime * 1000,
      timerProgressBar: true,
      didOpen: () => {
        // Saving referenced cooldown
        activeAlerts[site.id] = Swal;

        // Start interval
        intervals[site.id] = setInterval(() => {
          const newRemainingTime = session.getCooldownRemaining(site.id);
          
          Swal.update({
            html: `You need to wait <b>${newRemainingTime}</b> seconds before taking another screenshot.`,
          });

          // Remove cooldown when 0
          if (newRemainingTime <= 0) {
            clearInterval(intervals[site.id]);
            delete intervals[site.id];
            delete activeAlerts[site.id];
          }
        }, 1000);
      },
      willClose: () => {
        // Remove reference
        clearInterval(intervals[site.id]);
        delete intervals[site.id];
        delete activeAlerts[site.id];
      },
    });
  };

  return {
    successAlert,
    errorAlert,
    confirmAlert,
    promptAlert,
    cooldownAlert
  };
}
