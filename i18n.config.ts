export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      en: 'English',
      ko: 'Korean',

      selectWorkspace: 'Please select workspace.',

      name: 'Name',
      lastModified: 'Last Modified',
      size: 'Size',
      etc: '',
      delete: 'Delete',
      download: 'Download',
      creationDate: 'Creation Date',
      add: 'Add',
      cancel: 'Cancel',
      setting: 'Setting',
      search: 'Search',
      create: 'Create',
      upload: 'Upload',

      emptyBucket: {
        button: 'Empty',
        title: 'Empty Bucket',
        contentMessage: 'Permanently delete all objects in bucket "{name}"?',
        successMessage: 'Success',
      },

      createBucket: {
        button: 'New Bucket',
        title: 'New Bucket',
        namePlaceholder: 'Enter bucket Name',
        successMessage: 'Bucket has been created',
      },

      createFolder: {
        button: 'Create Folder',
        title: 'Create Folder',
        namePlaceholder: 'Enter folder name',
        contentMessage: 'Folder names can\'t contain "/"',
        successMessage: 'Success',
      },

      dropzone: {
        message: 'Drop Files',
      },

      deleteBucket: {
        contentMessage:
          '(en) "{name}" 해당 버킷에 존재하는 파일 및 폴더가 모두 삭제됩니다. 정말 삭제하시겠습니까?',
      },

      deleteFile: {
        contentMessage: '(en) 삭제 하시겠습니까?',
        successMessage: '(en) 삭제에 성공하였습니다.',
        errorMessage: '(en) 삭제에 실패하였습니다.',
      },

      uploadFile: {
        contentMessage: '(en) 업로드 하시겠습니까?',
        successMessage: '(en) 업로드에 성공하였습니다.',
        errorMessage: '(en) 업로드에 실패하였습니다.',
      },

      b: {
        title: 'General purpose buckets',
      },
    },
    ko: {
      en: '영어',
      ko: '한국어',

      selectWorkspace: '워크스페이스를 선택해주세요.',

      name: '이름',
      lastModified: '마지막 수정',
      size: '크기',
      etc: '',
      delete: '삭제',
      download: '다운로드',
      creationDate: '생성일',
      add: '추가하기',
      cancel: '취소',
      setting: '설정',
      search: '검색',
      create: '생성',
      upload: '업로드',

      emptyBucket: {
        button: '비우기',
        title: '버킷 비우기',
        contentMessage:
          '"{name}" 해당 버킷에 있는 모든 오브젝트가 영구적으로 제거됩니다',
        successMessage: '성공하였습니다',
      },

      createBucket: {
        button: '버킷 만들기',
        title: '새 버킷',
        namePlaceholder: '버킷 이름 입력',
        successMessage: '버킷 생성 완료',
      },

      createFolder: {
        button: '폴더 만들기',
        title: '폴더 만들기',
        namePlaceholder: '폴더 이름 입력',
        contentMessage: 'Folder names can\'t contain "/"',
        successMessage: '성공하였습니다.',
      },

      dropzone: {
        message: '파일을 올려놓으세요',
      },

      deleteBucket: {
        contentMessage:
          '"{name}" 해당 버킷에 존재하는 파일 및 폴더가 모두 삭제됩니다. 정말 삭제하시겠습니까?',
      },

      deleteFile: {
        contentMessage: '삭제 하시겠습니까?',
        successMessage: '삭제에 성공하였습니다.',
        errorMessage: '삭제에 실패하였습니다.',
      },

      uploadFile: {
        contentMessage: '업로드 하시겠습니까?',
        successMessage: '업로드에 성공하였습니다.',
        errorMessage: '업로드에 실패하였습니다.',
      },

      b: {
        title: '범용 버킷',
      },
    },
  },

  datetimeFormats: {
    en: {
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        // weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      },
    },
    ko: {
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        // weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      },
    },
  },
}))
