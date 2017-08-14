<?php

namespace S7tH\UserBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

use FOS\UserBundle\Model\User as BaseUser;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * User
 *
 * @ORM\Table(name="`user`")
 * @ORM\Entity(repositoryClass="S7tH\UserBundle\Repository\UserRepository")
 */
class User extends BaseUser
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="gravatar", type="string", length=40, unique=true)
     * @Assert\NotBlank(message="Merci d'entrer votre adresse gravatar.", groups={"Registration", "Profile"})
     */
    protected $gravatar;

    /**
     * Set gravatar
     *
     * @param string $gravatar
     *
     * @return User
     */
    public function setGravatar($gravatar)
    {
        $this->gravatar = $gravatar;

        return $this;
    }

    /**
     * Get gravatar
     *
     * @return string
     */
    public function getGravatar()
    {
        return $this->gravatar;
    }
}
