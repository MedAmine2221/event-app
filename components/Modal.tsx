export default function Modal({
    isModalOpen,
    onClose
}: {isModalOpen: boolean; onClose: () => void}) {
    console.log(isModalOpen);
    
  return (
    isModalOpen ? (<div>
        <p>
            hello world
            </p>
            <button onClick={onClose}>fermer</button>
        </div>) : (<div>by by</div>)
  )
}
