import { MediaType } from '~/constants/enums'

// 1 media thì sẽ có đường dẫn và LOẠI
export interface Media {
  url: string
  type: MediaType
}
