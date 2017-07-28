<?php

namespace S7tH\DirectoryBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

//use annotation with alias Assert to fixe the valides rules
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Commentary
 *
 * @ORM\Table(name="commentary")
 * @ORM\Entity(repositoryClass="S7tH\DirectoryBundle\Repository\CommentaryRepository")
 */
class Commentary
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
     * @var \DateTime
     *
     * @ORM\Column(name="date", type="datetimetz")
     * @Assert\DateTime()
     */
    private $date;

    /**
     * @var string
     *
     * @ORM\Column(name="message", type="text")
     * @Assert\NotBlank()
     */
    private $message;

    /**
     * @ORM\ManyToOne(targetEntity="S7tH\DirectoryBundle\Entity\Tricks", cascade={"persist"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $trick;

    /**
     * @ORM\ManyToOne(targetEntity="S7tH\UserBundle\Entity\User", cascade={"persist"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

     public function __construct(\S7tH\DirectoryBundle\Entity\Tricks $trick)
    {
        $this->date = new \Datetime();
        $this->setTrick($trick);
    }

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
     * Set date
     *
     * @param \DateTime $date
     *
     * @return Commentary
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set message
     *
     * @param string $message
     *
     * @return Commentary
     */
    public function setMessage($message)
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get message
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    
    /**
     * Get trick
     *
     * @return \S7tH\DirectoryBundle\Entity\Tricks
     */
    public function getTrick()
    {
        return $this->trick;
    }

    /**
     * Set trick
     *
     * @param \S7tH\DirectoryBundle\Entity\Tricks $trick
     *
     * @return Commentary
     */
    public function setTrick(\S7tH\DirectoryBundle\Entity\Tricks $trick)
    {
        $this->trick = $trick;

        return $this;
    }

    /**
     * Set user
     *
     * @param \S7tH\UserBundle\Entity\User $user
     *
     * @return Commentary
     */
    public function setUser(\S7tH\UserBundle\Entity\User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \S7tH\UserBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }
}
