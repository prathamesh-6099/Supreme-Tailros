import NewOrderForm from './NewOrderForm'

export const metadata = {
  title: 'New Order — Supreme Tailors',
}

export default function NewOrderPage() {
  return (
    <div className="py-2">
      <NewOrderForm />
    </div>
  )
}
