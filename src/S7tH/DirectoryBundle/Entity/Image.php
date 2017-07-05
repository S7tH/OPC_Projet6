<?php

namespace S7tH\DirectoryBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

//call this to Upload files
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Image
 *
 * @ORM\Table(name="image")
 * @ORM\Entity(repositoryClass="S7tH\DirectoryBundle\Repository\ImageRepository")
 */
class Image
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="string", length=255)
     */
    private $url;

    /**
     * @var string
     *
     * @ORM\Column(name="alt", type="string", length=255)
     */
    private $alt;

    //any anotation because it isn't this var who will be persited by doctrine for our file
    private $file;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set url
     *
     * @param string $url
     *
     * @return Image
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set alt
     *
     * @param string $alt
     *
     * @return Image
     */
    public function setAlt($alt)
    {
        $this->alt = $alt;

        return $this;
    }

    /**
     * Get alt
     *
     * @return string
     */
    public function getAlt()
    {
        return $this->alt;
    }

    public function setFile(UploaderFile $file = null)
    {
        $this->file = $file;
    }

    public function upload()
    {
    // if there isn't any file  
    if (null === $this->file) {
      return;
    }

    // we are recovering the original name of client's file
    $name = $this->file->getClientOriginalName();

    // we are moving the send file in the repository of our choice.
    $this->file->move($this->getUploadRootDir(), $name);

    // we are saving the file name in our $url attribut
    $this->url = $name;

    //we are creating the futur alt attribut of our markup <img>
    $this->alt = $name;
  }

  public function getUploadDir()
  {
    // we return the relative path to the image for a navigator
    return 'uploads/img';
  }

  protected function getUploadRootDir()
  {
    // we return the relative path to the image for our PHP code
    return __DIR__.'/../../../../web/'.$this->getUploadDir();
  }
}
