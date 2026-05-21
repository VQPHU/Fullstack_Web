import React from 'react'
import PrivacySection from '@/components/privacy/PrivacySection'
import { fetchData } from '@/lib/api'

const PagePrivacy = async () => {
    const data = await fetchData<any>('/privacy')

    return <PrivacySection data={data} />
}

export default PagePrivacy